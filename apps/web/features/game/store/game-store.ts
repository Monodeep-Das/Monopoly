import { create } from 'zustand';
import { GameState, GameEvent, GameAction } from '@richup/shared-types';

interface GameStore {
  gameState: GameState | null;
  isConnected: boolean;
  roomId: string | null;
  socket: any | null; // Placeholder for actual socket instance
  idleTimeoutAt: number | null;
  spectators: { id: string; username: string }[];
  
  // Actions
  setGameState: (state: GameState | null) => void;
  resetGameState: () => void;
  applyEvent: (event: GameEvent) => void;
  setConnection: (status: boolean, roomId: string | null, socket: any) => void;
  dispatchAction: (action: any) => void;
  sendChat: (message: string) => void;
  setIdleTimeout: (timeoutAt: number | null) => void;
  setSpectators: (spectators: { id: string; username: string }[]) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  isConnected: false,
  roomId: null,
  socket: null,
  idleTimeoutAt: null,
  spectators: [],

  setGameState: (state) => set({ gameState: state, idleTimeoutAt: null }),
  
  resetGameState: () => set({ gameState: null, idleTimeoutAt: null }),

  applyEvent: (event) => {
    // In a full implementation, you might apply events optimistically
    // but the server remains authoritative. We rely on setGameState for true sync.
    // This is primarily for triggering UI animations (like moving a token).
    console.log('Received Game Event:', event);
  },

  setConnection: (isConnected, roomId, socket) => set({ isConnected, roomId, socket }),

  dispatchAction: (action) => {
    const { socket, isConnected } = get();
    if (isConnected && socket) {
      socket.emit('game_action', action);
    } else {
      console.error('Cannot dispatch action, not connected to game room');
    }
  },

  sendChat: (message: string) => {
    const { socket, isConnected } = get();
    if (isConnected && socket) {
      socket.emit('chat:send', { message });
    } else {
      console.error('Cannot send chat, not connected to game room');
    }
  },

  setIdleTimeout: (timeoutAt) => set({ idleTimeoutAt: timeoutAt }),

  setSpectators: (spectators) => set({ spectators }),
}));
