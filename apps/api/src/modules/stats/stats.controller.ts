import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('leaderboard')
  async getLeaderboard() {
    return this.statsService.getLeaderboard();
  }

  @UseGuards(ClerkAuthGuard)
  @Get('history')
  async getMyHistory(@Request() req: any) {
    return this.statsService.getMatchHistory(req.user.id);
  }

  @UseGuards(ClerkAuthGuard)
  @Get('me')
  async getMyStats(@Request() req: any) {
    return this.statsService.getUserStats(req.user.id);
  }

  @Get(':userId')
  async getUserStats(@Param('userId') userId: string) {
    return this.statsService.getUserStats(userId);
  }
}
