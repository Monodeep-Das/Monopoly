import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GameStatus } from '@prisma/client';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getLeaderboard(limit: number = 50) {
    const users = await this.prisma.user.findMany({
      where: { gamesPlayed: { gt: 0 } },
      orderBy: [
        { wins: 'desc' },
        { gamesPlayed: 'asc' }, // Tie breaker: fewer games to get those wins is better
      ],
      take: limit,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        wins: true,
        losses: true,
        gamesPlayed: true,
      },
    });

    return users.map((u, index) => ({
      rank: index + 1,
      ...u,
      winRate: u.gamesPlayed > 0 ? (u.wins / u.gamesPlayed) * 100 : 0,
    }));
  }

  async getMatchHistory(userId: string, limit: number = 20) {
    const gamePlayers = await this.prisma.gamePlayer.findMany({
      where: { userId },
      include: {
        game: {
          include: {
            room: true,
            players: {
              include: { user: { select: { username: true } } }
            }
          }
        }
      },
      orderBy: { game: { startedAt: 'desc' } },
      take: limit,
    });

    return gamePlayers.map(gp => {
      const isWinner = gp.game.winnerId === userId;
      return {
        gameId: gp.gameId,
        roomName: gp.game.room.name,
        startedAt: gp.game.startedAt,
        endedAt: gp.game.endedAt,
        status: gp.game.status,
        result: gp.game.status === GameStatus.FINISHED ? (isWinner ? 'Victory' : 'Defeat') : 'In Progress',
        rank: gp.finalRank,
        finalMoney: gp.money,
        opponents: gp.game.players
          .filter(p => p.userId !== userId)
          .map(p => p.user.username),
      };
    });
  }

  async getUserStats(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        username: true,
        wins: true,
        losses: true,
        gamesPlayed: true,
        createdAt: true,
      }
    });

    if (!user) return null;

    return {
      ...user,
      winRate: user.gamesPlayed > 0 ? (user.wins / user.gamesPlayed) * 100 : 0,
    };
  }
}
