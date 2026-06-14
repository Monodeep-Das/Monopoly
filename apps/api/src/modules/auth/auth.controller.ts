import { Controller, Request, Get, UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';

@Controller('auth')
export class AuthController {
  @UseGuards(ClerkAuthGuard)
  @Get('me')
  getProfile(@Request() req: any) {
    // req.user is the Prisma User attached by ClerkAuthGuard
    return req.user;
  }
}
