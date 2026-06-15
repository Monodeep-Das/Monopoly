import { fetchApi } from '@/lib/api-client';

export interface Room {
  id: string;
  name: string;
  hostId: string;
  status: string;
  maxPlayers: number;
  startingCash: number;
  map: string;
  players: { userId: string; nickname?: string | null; color?: string | null; user: { username: string; avatarUrl: string | null } }[];
}

export const roomsApi = {
  getRooms: () => fetchApi<Room[]>('/rooms'),
  
  updatePlayerProfile: (roomId: string, playerId: string, profile: { nickname?: string; color?: string }) =>
    fetchApi<Room>(`/rooms/${roomId}/players/${playerId}/profile`, {
      method: 'POST',
      body: JSON.stringify(profile),
    }),
  
  createRoom: (data: { name?: string; maxPlayers?: number; startingCash?: number; map?: string }) => 
    fetchApi<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    
  getRoomById: (id: string) => fetchApi<Room>(`/rooms/${id}`),
  
  joinRoom: (id: string) => fetchApi<Room>(`/rooms/${id}/join`, {
    method: 'POST',
  }),

  deleteRoom: (id: string) => fetchApi<{success: boolean}>(`/rooms/${id}`, {
    method: 'DELETE',
  }),

  fillBots: (id: string) => fetchApi<Room>(`/rooms/${id}/bots`, {
    method: 'POST',
  }),

  updateRoomSettings: (id: string, settings: { maxPlayers?: number; startingCash?: number; map?: string }) => 
    fetchApi<Room>(`/rooms/${id}/settings`, {
      method: 'POST',
      body: JSON.stringify(settings),
    }),

  kickPlayer: (roomId: string, playerId: string) => fetchApi<Room>(`/rooms/${roomId}/players/${playerId}`, {
    method: 'DELETE',
  }),
};
