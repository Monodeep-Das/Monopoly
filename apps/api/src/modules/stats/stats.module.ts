import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { DatabaseModule } from '../../database/database.module';
import { UsersModule } from '../users/users.module';

import { GameModule } from '../game/game.module';

@Module({
  imports: [DatabaseModule, UsersModule, GameModule],
  providers: [StatsService],
  controllers: [StatsController],
})
export class StatsModule {}
