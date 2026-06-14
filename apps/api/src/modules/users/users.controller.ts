import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      wins: user.wins,
      losses: user.losses,
      gamesPlayed: user.gamesPlayed,
      createdAt: user.createdAt,
    };
  }
}
