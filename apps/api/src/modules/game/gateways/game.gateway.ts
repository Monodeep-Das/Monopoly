import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, OnModuleInit } from '@nestjs/common';
import { WsClerkAuthGuard } from '../../auth/guards/ws-clerk.guard';
import { GameService } from '../services/game.service';
import { GameAction } from '@richup/shared-types';

@WebSocketGateway({
  cors: { origin: '*' }, // Configure appropriately for production
  namespace: '/game',
})
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(GameGateway.name);

  // Map Socket ID -> Room ID
  private clientRooms = new Map<string, string>();

  constructor(private gameService: GameService) {}

  onModuleInit() {
    this.gameService.broadcastCallback = (roomId, events, state) => {
      if (events && events.length > 0) {
        this.server.to(roomId).emit('game_events', events);
      }
      this.server.to(roomId).emit('game_state', state);
    };

    this.gameService.broadcastRawCallback = (roomId, event, payload) => {
      this.server.to(roomId).emit(event, payload);
    };
  }

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.gameService.incrementOnlinePlayers();
    // Authentication is handled in guards or explicitly upon join
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.gameService.decrementOnlinePlayers();
    const roomId = this.clientRooms.get(client.id);
    if (roomId) {
      const gameId = this.gameService.getGameIdForRoom(roomId);
      if (gameId) {
        this.gameService.removeClientFromGame(gameId, client.id);
        this.gameService.removeSpectator(gameId, client.id);
      }
      this.clientRooms.delete(client.id);
    }
  }

  @UseGuards(WsClerkAuthGuard)
  @SubscribeMessage('join_room')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    console.log('--- handleJoinRoom called ---', data);
    const { roomId } = data;
    const user = client.data.user; // Set by WsJwtGuard

    if (!roomId) return { status: 'error', message: 'Room ID required' };

    await client.join(roomId);
    this.clientRooms.set(client.id, roomId);

    let gameId = this.gameService.getGameIdForRoom(roomId);
    if (!gameId) {
      gameId = await this.gameService.restoreGameFromDB(roomId);
    }

    if (gameId) {
      const engine = this.gameService.getGameEngine(gameId);
      
      if (engine) {
        const isPlayer = engine.getState().players.some(p => p.id === user.sub);
        if (isPlayer) {
          this.gameService.addClientToGame(gameId, client.id);
        } else {
          // Join as Spectator
          this.gameService.addSpectator(gameId, client.id, { id: user.sub, username: user.username || 'Guest' });
        }
        
        client.emit('game_state', engine.getState());
        client.emit('spectators_updated', this.gameService.getSpectators(gameId));
      }
    } else {
      const status = await this.gameService.getRoomStatus(roomId);
      if (status === 'FINISHED') {
        const state = await this.gameService.getLastGameState(roomId);
        if (state) {
          client.emit('game_state', state);
        } else {
          client.emit('game_aborted', { reason: 'not_found' });
        }
      } else if (!status || status === 'ABORTED') {
        client.emit('game_aborted', { reason: 'not_found' });
      }
      // If status === 'WAITING', it just hasn't started yet, so do nothing.
    }

    this.logger.log(`User ${user.sub} joined room ${roomId}`);
    return { status: 'ok', roomId };
  }

  @UseGuards(WsClerkAuthGuard)
  @SubscribeMessage('game_action')
  async handleGameAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() action: GameAction,
  ) {
    const user = client.data.user;
    const roomId = this.clientRooms.get(client.id);
    
    if (!roomId) return { status: 'error', message: 'Not in a room' };
    
    const gameId = this.gameService.getGameIdForRoom(roomId);
    if (!gameId) return { status: 'error', message: 'Game not started' };

    // Security: ensure the player is dispatching their own action (if applicable)
    // Actually, the engine validates this, but let's override playerId just to be safe
    const secureAction: any = { ...action, playerId: user.sub };

    const events = await this.gameService.dispatchAction(gameId, secureAction as GameAction);
    
    if (events && events.length > 0) {
      // Broadcast events to everyone in the room
      // Since dispatchAction now invokes broadcastCallback, we DO NOT need to emit it here again!
      // Otherwise we get duplicate events.
    }

    return { status: 'ok' };
  }

  @UseGuards(WsClerkAuthGuard)
  @SubscribeMessage('chat:send')
  async handleChatSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { message: string },
  ) {
    const user = client.data.user;
    const roomId = this.clientRooms.get(client.id);
    
    if (!roomId) return { status: 'error', message: 'Not in a room' };
    
    const gameId = this.gameService.getGameIdForRoom(roomId);
    if (!gameId) return { status: 'error', message: 'Game not started' };

    await this.gameService.handleChat(gameId, user.sub, payload.message);
    
    return { status: 'ok' };
  }

  @UseGuards(WsClerkAuthGuard)
  @SubscribeMessage('room_chat_send')
  async handleRoomChatSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { text: string },
  ) {
    const user = client.data.user;
    const roomId = this.clientRooms.get(client.id);
    
    if (!roomId) return { status: 'error', message: 'Not in a room' };
    
    // Broadcast message to everyone in the room
    this.server.to(roomId).emit('room_chat_receive', { 
      sender: user.username || 'Guest', 
      text: payload.text 
    });
    
    return { status: 'ok' };
  }

  @UseGuards(WsClerkAuthGuard)
  @SubscribeMessage('start_game')
  async handleStartGame(@ConnectedSocket() client: Socket) {
    console.log('--- handleStartGame called --- for client:', client.id);
    const roomId = this.clientRooms.get(client.id);
    if (!roomId) return { status: 'error', message: 'Not in a room' };

    // Check if game already exists
    let gameId = this.gameService.getGameIdForRoom(roomId);
    if (!gameId) {
      // Host initiated game start
      await this.gameService.createGame(roomId);
      gameId = this.gameService.getGameIdForRoom(roomId);
    }
    
    // Broadcast to room
    this.server.to(roomId).emit('game_started', { gameId, roomId });
    
    // Also emit the initial game state
    const engine = this.gameService.getGameEngine(gameId!);
    if (engine) {
      this.server.to(roomId).emit('game_state', engine.getState());
    }

    return { status: 'ok' };
  }
}
