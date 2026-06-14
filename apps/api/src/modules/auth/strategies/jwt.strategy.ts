import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev-secret-key',
    });
  }

  async validate(payload: any) {
    // payload.sub is the user id
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      username: user.username,
      isGuest: user.isGuest,
      avatarUrl: user.avatarUrl,
    };
  }
}
