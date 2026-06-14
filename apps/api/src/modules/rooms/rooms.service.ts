import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RoomStatus } from '@prisma/client';

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

  async createRoom(hostId: string, name: string, maxPlayers: number) {
    const room = await this.prisma.room.create({
      data: {
        name,
        hostId,
        maxPlayers,
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
      where: { status: RoomStatus.WAITING },
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
}
