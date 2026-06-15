import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RoomStatus } from '@prisma/client';
import * as crypto from 'crypto';

@Injectable()
export class RoomsService implements OnModuleInit {
  private readonly logger = new Logger(RoomsService.name);

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    // Run stale room cleanup every 30 minutes
    setInterval(() => this.cleanupStaleRooms(), 30 * 60 * 1000);
  }

  private async cleanupStaleRooms() {
    try {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const staleRooms = await this.prisma.room.findMany({
        where: {
          status: RoomStatus.WAITING,
          createdAt: { lt: twoHoursAgo }
        }
      });

      if (staleRooms.length > 0) {
        for (const room of staleRooms) {
          await this.prisma.roomPlayer.deleteMany({ where: { roomId: room.id } });
          await this.prisma.game.deleteMany({ where: { roomId: room.id } });
          await this.prisma.room.delete({ where: { id: room.id } });
        }
        this.logger.log(`Cleaned up ${staleRooms.length} stale WAITING rooms.`);
      }
    } catch (e) {
      this.logger.error('Failed to clean up stale rooms', e);
    }
  }

  async createRoom(hostId: string, name: string, maxPlayers: number, startingCash?: number, map?: string) {
    const shortId = crypto.randomBytes(3).toString('hex').toUpperCase();

    const room = await this.prisma.room.create({
      data: {
        id: shortId,
        name,
        hostId,
        maxPlayers,
        startingCash: startingCash ?? 1500,
        map: map ?? "classic",
        status: RoomStatus.WAITING,
        players: {
          create: {
            userId: hostId,
          },
        },
      },
      include: {
        players: { include: { user: true } },
      },
    });
    return room;
  }

  async getRooms() {
    return this.prisma.room.findMany({
      where: { status: { in: [RoomStatus.WAITING, RoomStatus.IN_GAME] } },
      include: {
        players: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRoomById(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        players: { include: { user: true } },
      },
    });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async deleteRoom(id: string, userId: string) {
    const room = await this.prisma.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    
    if (room.hostId !== userId) {
      throw new BadRequestException('Only the host can delete the room');
    }

    // Prisma cascades deletes if set up, or we can just delete directly
    // Let's delete room players first to avoid foreign key constraints if not cascaded
    await this.prisma.roomPlayer.deleteMany({ where: { roomId: id } });
    
    // Also delete any games associated
    await this.prisma.game.deleteMany({ where: { roomId: id } });
    
    await this.prisma.room.delete({ where: { id } });
    
    return { success: true };
  }

  async joinRoom(roomId: string, userId: string) {
    const room = await this.getRoomById(roomId);

    if (room.status !== RoomStatus.WAITING) {
      throw new BadRequestException('Room is not accepting players');
    }

    if (room.players.length >= room.maxPlayers) {
      throw new BadRequestException('Room is full');
    }

    const existingPlayer = room.players.find(p => p.userId === userId);
    if (existingPlayer) {
      return room; // Already joined
    }

    await this.prisma.roomPlayer.create({
      data: {
        roomId,
        userId,
      },
    });

    return this.getRoomById(roomId);
  }

  async fillWithBots(roomId: string) {
    const room = await this.getRoomById(roomId);

    if (room.status !== RoomStatus.WAITING) {
      throw new BadRequestException('Room is not accepting players');
    }

    const emptySlots = room.maxPlayers - room.players.length;
    if (emptySlots <= 0) {
      throw new BadRequestException('Room is already full');
    }

    const botNames = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon'];
    
    for (let i = 0; i < emptySlots; i++) {
      const botName = `${botNames[Math.floor(Math.random() * botNames.length)]}_${Math.floor(Math.random() * 10000)}`;
      
      const botUser = await this.prisma.user.create({
        data: {
          username: botName,
          isGuest: true,
          isBot: true,
        },
      });

      await this.prisma.roomPlayer.create({
        data: {
          roomId,
          userId: botUser.id,
        },
      });
    }

    return this.getRoomById(roomId);
  }

  async updatePlayerProfile(roomId: string, userId: string, profile: { nickname?: string; color?: string }) {
    const room = await this.prisma.room.findUnique({
      where: { id: roomId },
      include: { players: true },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.status !== RoomStatus.WAITING) {
      throw new BadRequestException('Cannot update profile after game has started');
    }

    if (profile.color) {
      const isTaken = room.players.some(p => p.userId !== userId && p.color === profile.color);
      if (isTaken) {
        throw new BadRequestException('Color is already taken by another player');
      }
    }

    try {
      await this.prisma.roomPlayer.update({
        where: { roomId_userId: { roomId, userId } },
        data: {
          nickname: profile.nickname,
          color: profile.color,
        },
      });
    } catch (e) {
      throw new BadRequestException('Player not in room');
    }

    return this.getRoomById(roomId);
  }

  async updateRoomSettings(roomId: string, userId: string, settings: { maxPlayers?: number; startingCash?: number; map?: string }) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    
    if (room.hostId !== userId) {
      throw new BadRequestException('Only the host can update room settings');
    }

    if (room.status !== RoomStatus.WAITING) {
      throw new BadRequestException('Cannot change settings after game has started');
    }

    await this.prisma.room.update({
      where: { id: roomId },
      data: {
        maxPlayers: settings.maxPlayers,
        startingCash: settings.startingCash,
        map: settings.map,
      },
    });

    return this.getRoomById(roomId);
  }

  async kickPlayer(roomId: string, hostId: string, playerIdToKick: string) {
    const room = await this.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException('Room not found');
    
    if (room.hostId !== hostId) {
      throw new BadRequestException('Only the host can kick players');
    }

    if (hostId === playerIdToKick) {
      throw new BadRequestException('Host cannot kick themselves');
    }

    if (room.status !== RoomStatus.WAITING) {
      throw new BadRequestException('Cannot kick players after game has started');
    }

    await this.prisma.roomPlayer.deleteMany({
      where: {
        roomId,
        userId: playerIdToKick,
      },
    });

    return this.getRoomById(roomId);
  }
}
