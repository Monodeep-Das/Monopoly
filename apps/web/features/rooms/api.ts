import { fetchApi } from '@/lib/api-client';

export interface Room {
  id: string;
  name: string;
  hostId: string;
  status: string;
  maxPlayers: number;
  players: { userId: string; user: { username: string; avatarUrl: string | null } }[];
}

export const roomsApi = {
  getRooms: () => fetchApi<Room[]>('/rooms'),
  
  createRoom: (data: { name?: string; maxPlayers?: number }) => 
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
};
