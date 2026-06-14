import { fetchApi } from '@/lib/api-client';

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatarUrl: string | null;
  wins: number;
  losses: number;
  gamesPlayed: number;
  rank: number;
  winRate: number;
}

export interface MatchHistoryEntry {
  gameId: string;
  roomName: string;
  startedAt: string;
  endedAt: string | null;
  status: string;
  result: string;
  rank: number | null;
  finalMoney: number;
  opponents: string[];
}

export interface UserStats {
  username: string;
  wins: number;
  losses: number;
  gamesPlayed: number;
  winRate: number;
  createdAt: string;
}

export const statsApi = {
  getLeaderboard: () => fetchApi<LeaderboardEntry[]>('/stats/leaderboard'),
  getMyHistory: () => fetchApi<MatchHistoryEntry[]>('/stats/history'),
  getMyStats: () => fetchApi<UserStats>('/stats/me'),
};
