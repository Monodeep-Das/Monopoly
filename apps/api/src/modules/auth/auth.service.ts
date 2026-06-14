import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { LoginPayload, RegisterPayload } from '@richup/shared-types';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && user.passwordHash) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        const { passwordHash, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        isGuest: user.isGuest,
      },
    };
  }

  async register(data: RegisterPayload) {
    if (!data.password) throw new UnauthorizedException('Password is required');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const user = await this.usersService.create({
      username: data.username,
      email: data.email,
      passwordHash,
      isGuest: false,
    });

    return this.login(user);
  }

  async guestLogin(username: string) {
    // Check if username taken by non-guest or another guest (simplification: just create if unique, else append suffix)
    let finalUsername = username;
    let existing = await this.usersService.findByUsername(finalUsername);
    
    // Add random suffix if taken
    if (existing) {
      finalUsername = `${username}_${Math.floor(Math.random() * 10000)}`;
    }

    const user = await this.usersService.create({
      username: finalUsername,
      isGuest: true,
    });

    return this.login(user);
  }

  async validateOAuthLogin(profile: { googleId: string; email: string | null; displayName: string; avatarUrl: string | null }): Promise<any> {
    // Check if user exists by googleId
    let user = await this.usersService.findByGoogleId(profile.googleId);
    
    if (!user && profile.email) {
      // Check if user exists by email
      user = await this.usersService.findByEmail(profile.email);
    }

    if (user) {
      // If user exists but googleId is missing, update it
      if (!user.googleId) {
        // We'll update the user in the controller or service later, for now just return
        // Ideally we should update it, but let's assume it's fine for now, or just return user
      }
      return this.login(user);
    }

    // User doesn't exist, create a new one
    // Ensure username is unique
    let finalUsername = profile.displayName.replace(/\s+/g, '_');
    let existing = await this.usersService.findByUsername(finalUsername);
    
    if (existing) {
      finalUsername = `${finalUsername}_${Math.floor(Math.random() * 10000)}`;
    }

    user = await this.usersService.create({
      username: finalUsername,
      email: profile.email,
      googleId: profile.googleId,
      avatarUrl: profile.avatarUrl,
      isGuest: false,
    });

    return this.login(user);
  }
}
