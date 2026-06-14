import { Module } from '@nestjs/common';
import { GameGateway } from './gateways/game.gateway';
import { GameService } from './services/game.service';
import { UsersModule } from '../users/users.module';

import { BotService } from './services/bot.service';

@Module({
  imports: [UsersModule],
  providers: [GameGateway, GameService, BotService],
  exports: [GameService],
})
export class GameModule {}
