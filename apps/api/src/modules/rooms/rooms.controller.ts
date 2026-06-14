import { Controller, Post, Get, Delete, Param, UseGuards, Request, Body } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @UseGuards(ClerkAuthGuard)
  @Post()
  async createRoom(@Request() req: any, @Body() body: { name?: string; maxPlayers?: number }) {
    const hostId = req.user.id;
    const name = body.name || `${req.user.username}'s Game`;
    const maxPlayers = body.maxPlayers || 4;
    return this.roomsService.createRoom(hostId, name, maxPlayers);
  }

  @Get()
  async getRooms() {
    return this.roomsService.getRooms();
  }

  @Get(':id')
  async getRoom(@Param('id') id: string) {
    return this.roomsService.getRoomById(id);
  }

  @UseGuards(ClerkAuthGuard)
  @Delete(':id')
  async deleteRoom(@Param('id') id: string, @Request() req: any) {
    return this.roomsService.deleteRoom(id, req.user.id);
  }

  @UseGuards(ClerkAuthGuard)
  @Post(':id/join')
  async joinRoom(@Param('id') id: string, @Request() req: any) {
    return this.roomsService.joinRoom(id, req.user.id);
  }

  @UseGuards(ClerkAuthGuard)
  @Post(':id/bots')
  async fillWithBots(@Param('id') id: string) {
    return this.roomsService.fillWithBots(id);
  }
}
