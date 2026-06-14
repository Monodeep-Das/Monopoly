import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { GameModule } from './modules/game/game.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { StatsModule } from './modules/stats/stats.module';

@Module({
  imports: [DatabaseModule, AuthModule, UsersModule, GameModule, RoomsModule, StatsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
