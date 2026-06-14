import { Injectable, Logger, NotFoundException, forwardRef, Inject, OnModuleInit } from '@nestjs/common';
// Trigger API restart
import { PrismaService } from '../../../database/prisma.service';
import { Game } from '@richup/game-engine';
import { GameState, GameAction, GameEvent } from '@richup/shared-types';
import { BotService } from './bot.service';
import { RoomStatus } from '@prisma/client';

interface ActiveGame {
  engine: Game;
  clients: Set<string>; // Socket IDs of connected clients
  lastActionTime: number;
  idleWarningSent: boolean;
}

@Injectable()
export class GameService implements OnModuleInit {
  private readonly logger = new Logger(GameService.name);
  
  // In-memory active games keyed by Game ID
  private activeGames = new Map<string, ActiveGame>();
  
  // Map Room ID -> Game ID (to find the active game for a room)
  private roomToGame = new Map<string, string>(); // roomId -> gameId
  private auctionTimers = new Map<string, NodeJS.Timeout>();

  // Callback to broadcast state updates directly from the engine to the Gateway
  public broadcastCallback?: (roomId: string, events: GameEvent[], state: GameState) => void;
  // Callback to emit arbitrary raw socket events
  public broadcastRawCallback?: (roomId: string, event: string, payload: any) => void;

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => BotService))
    private botService: BotService,
  ) {}

  onModuleInit() {
    setInterval(() => this.checkIdleGames(), 10000); // Check every 10 seconds
  }

  private async checkIdleGames() {
    const now = Date.now();
    for (const [gameId, activeGame] of this.activeGames.entries()) {
      const idleTime = now - activeGame.lastActionTime;
      
      const roomIdForGame = [...this.roomToGame.entries()].find(([k, v]) => v === gameId)?.[0];
      if (!roomIdForGame) continue;

      if (idleTime >= 5 * 60 * 1000) {
        // 5 minutes - Close the game
        await this.abortGame(gameId, roomIdForGame);
      } else if (idleTime >= 4 * 60 * 1000 && !activeGame.idleWarningSent) {
        // 4 minutes - Send warning
        activeGame.idleWarningSent = true;
        const timeoutAt = activeGame.lastActionTime + 5 * 60 * 1000;
        if (this.broadcastRawCallback) {
          this.broadcastRawCallback(roomIdForGame, 'idle_warning', { timeoutAt });
        }
      }
    }
  }

  async abortGame(gameId: string, roomId: string) {
    try {
      await this.prisma.game.update({
        where: { id: gameId },
        data: { status: 'ABORTED', endedAt: new Date() },
      });
      await this.prisma.room.update({
        where: { id: roomId },
        data: { status: RoomStatus.FINISHED },
      });
      
      if (this.broadcastRawCallback) {
        this.broadcastRawCallback(roomId, 'game_aborted', { reason: 'idle_timeout' });
      }
      
      this.activeGames.delete(gameId);
      this.roomToGame.delete(roomId);
      this.logger.log(`Game ${gameId} aborted due to inactivity`);
    } catch (e) {
      this.logger.error(`Failed to abort game ${gameId}`, e);
    }
  }

  async createGame(roomId: string): Promise<GameState> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: {
        players: {
          include: { user: true },
        },
      },
    });

    if (!room) throw new NotFoundException('Room not found');

    // Create DB Game record
    const dbGame = await this.prisma.game.create({
      data: {
        roomId,
        players: {
          create: room.players.map((p: any) => ({
            userId: p.userId,
            money: 1500,
          })),
        },
      },
    });

    // Create Engine Instance
    const playerSetup = room.players.map((p: any, i: number) => {
      const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];
      return {
        id: p.userId,
        name: p.user.username,
        color: colors[i % colors.length],
        isBot: p.user.isBot, // Inject isBot flag into the setup if needed, but Game engine doesn't strictly need it. We will use Prisma query later.
      };
    });

    const engine = new Game(playerSetup);
    const initialState = engine.getState();

    // Save initial state to DB
    await this.prisma.game.update({
      where: { id: dbGame.id },
      data: { gameState: engine.serialize() },
    });

    // Mark room as in progress so it disappears from the lobby
    await this.prisma.room.update({
      where: { id: roomId },
      data: { status: RoomStatus.IN_GAME },
    });

    this.activeGames.set(dbGame.id, {
      engine,
      clients: new Set(),
      lastActionTime: Date.now(),
      idleWarningSent: false,
    });
    this.roomToGame.set(roomId, dbGame.id);

    // Check if first player is a bot
    this.checkAndTriggerBotTurn(dbGame.id, initialState);

    return initialState;
  }

  getGameEngine(gameId: string): Game | undefined {
    return this.activeGames.get(gameId)?.engine;
  }

  getGameIdForRoom(roomId: string): string | undefined {
    return this.roomToGame.get(roomId);
  }

  async getRoomStatus(roomId: string): Promise<string | null> {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      select: { status: true }
    });
    return room ? room.status : null;
  }

  async restoreGameFromDB(roomId: string): Promise<string | undefined> {
    const game = await this.prisma.game.findFirst({
      where: { roomId, status: 'IN_PROGRESS' },
      orderBy: { startedAt: 'desc' },
    });

    if (game && game.gameState) {
      try {
        const stateObj = JSON.parse(game.gameState as string);
        const engine = Game.fromState(stateObj);
        
        this.activeGames.set(game.id, {
          engine,
          clients: new Set(),
          lastActionTime: Date.now(),
          idleWarningSent: false,
        });
        this.roomToGame.set(roomId, game.id);
        this.logger.log(`Restored game ${game.id} for room ${roomId} from DB`);
        
        // Ensure bot turn triggers if it's currently a bot's turn
        this.checkAndTriggerBotTurn(game.id, engine.getState());
        
        return game.id;
      } catch (e) {
        this.logger.error(`Failed to restore game ${game.id} from DB:`, e);
      }
    }
    return undefined;
  }

  addClientToGame(gameId: string, clientId: string) {
    const game = this.activeGames.get(gameId);
    if (game) {
      game.clients.add(clientId);
    }
  }

  removeClientFromGame(gameId: string, clientId: string) {
    const game = this.activeGames.get(gameId);
    if (game) {
      game.clients.delete(clientId);
      // Optional: Cleanup inactive games after a timeout
    }
  }

  async dispatchAction(gameId: string, action: GameAction): Promise<GameEvent[] | null> {
    const active = this.activeGames.get(gameId);
    if (!active) return null;

    active.lastActionTime = Date.now();
    active.idleWarningSent = false;

    const events = active.engine.dispatch(action);

    // --- Auction Timer Logic ---
    const newState = active.engine.getState();
    if (newState.phase === 'AUCTION' && newState.activeAuction) {
      if (this.auctionTimers.has(gameId)) {
        clearTimeout(this.auctionTimers.get(gameId));
      }
      const timer = setTimeout(() => {
        this.dispatchAction(gameId, { type: 'AUCTION_TIMEOUT' } as any);
      }, 7000);
      this.auctionTimers.set(gameId, timer);
    } else {
      if (this.auctionTimers.has(gameId)) {
        clearTimeout(this.auctionTimers.get(gameId));
        this.auctionTimers.delete(gameId);
      }
    }

    // Save state to DB after action asynchronously to not block
    this.prisma.game.update({
      where: { id: gameId },
      data: { 
        gameState: active.engine.serialize(),
        ...(newState.phase === 'GAME_OVER' ? { status: 'FINISHED', endedAt: new Date() } : {})
      },
    }).catch((err: any) => this.logger.error(`Failed to persist game state ${gameId}`, err));

    if (newState.phase === 'GAME_OVER') {
      const roomIdForGame = [...this.roomToGame.entries()].find(([k, v]) => v === gameId)?.[0];
      if (roomIdForGame) {
        this.prisma.room.update({
          where: { id: roomIdForGame },
          data: { status: RoomStatus.FINISHED },
        }).catch((err: any) => this.logger.error(`Failed to finish room ${roomIdForGame}`, err));
      }
      // Also cleanup active memory
      this.activeGames.delete(gameId);
      if (roomIdForGame) this.roomToGame.delete(roomIdForGame);
    }

    // If there is a broadcast callback, invoke it for automated/bot triggers
    if (this.broadcastCallback && events && events.length > 0) {
      const roomId = active.engine.getState().id; // Wait, GameState id is gameId. The room ID is needed.
      // We can find roomId from roomToGame by reverse lookup or just store it.
      const roomIdForGame = [...this.roomToGame.entries()].find(([k, v]) => v === gameId)?.[0];
      if (roomIdForGame) {
         this.broadcastCallback(roomIdForGame, events, active.engine.getState());
      }
    }

    // Check if the NEXT player is a bot
    this.checkAndTriggerBotTurn(gameId, active.engine.getState());

    return events;
  }

  async handleChat(gameId: string, playerId: string, message: string): Promise<void> {
    const active = this.activeGames.get(gameId);
    if (!active) return;

    active.lastActionTime = Date.now();
    active.idleWarningSent = false;

    const event = active.engine.addChat(playerId, message);

    this.prisma.game.update({
      where: { id: gameId },
      data: { gameState: active.engine.serialize() },
    }).catch((err: any) => this.logger.error(`Failed to persist game state ${gameId}`, err));

    if (this.broadcastCallback) {
      const roomIdForGame = [...this.roomToGame.entries()].find(([k, v]) => v === gameId)?.[0];
      if (roomIdForGame) {
         this.broadcastCallback(roomIdForGame, [event], active.engine.getState());
      }
    }
  }

  private async checkAndTriggerBotTurn(gameId: string, state: GameState) {
    if (state.phase === 'GAME_OVER') return;
    
    let targetPlayerIds: string[] = [];

    if (state.phase === 'AUCTION' && state.activeAuction) {
      targetPlayerIds.push(...state.activeAuction.participants);
    } else if (state.phase === 'BANKRUPT_RESOLUTION') {
      const bankruptPlayers = state.players.filter(p => p.cash < 0 && !p.bankrupt);
      if (bankruptPlayers.length > 0) {
        targetPlayerIds.push(...bankruptPlayers.map(p => p.id));
      } else {
        targetPlayerIds.push(state.players[state.currentPlayerIndex].id);
      }
    } else if (state.phase === 'TRADE' && state.activeTrade) {
      // The recipient of the trade must act
      targetPlayerIds.push(state.activeTrade.toPlayerId);
    } else {
      // Normal turn action
      targetPlayerIds.push(state.players[state.currentPlayerIndex].id);
    }
    
    // Check if these players are bots in the DB
    for (const playerId of targetPlayerIds) {
      const user = await this.prisma.user.findUnique({ where: { id: playerId } });
      if (user && user.isBot) {
        // It's a bot's turn! Let BotService handle it.
        // Call it asynchronously so it doesn't block the current action processing.
        setTimeout(() => {
          this.botService.handleTurn(gameId, playerId);
        }, 0);
      }
    }
  }
}
