import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { UsersService } from '../../users/users.service';

@Injectable()
export class WsClerkAuthGuard implements CanActivate {
  private clerkClient: ReturnType<typeof createClerkClient>;

  constructor(private usersService: UsersService) {
    this.clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_mock' });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    
    // If this socket has already been authenticated, bypass re-verification.
    // This is CRITICAL because Clerk session tokens expire every 60 seconds.
    // Re-verifying the initial handshake token on every message will fail after 1 minute.
    if (client.data?.user) {
      return true;
    }

    const token = this.extractTokenFromHeader(client);
    
    if (!token) {
      console.log('WsClerkAuthGuard: No token found in handshake');
      throw new WsException('Unauthorized');
    }
    
    try {
      const decoded = await this.clerkClient.verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_mock',
      });
      
      const clerkId = decoded.sub;

      let user = await this.usersService.findByClerkId(clerkId);
      
      if (!user) {
        // Auto-create Prisma User if they don't exist yet
        const clerkUser = await this.clerkClient.users.getUser(clerkId);
        
        let finalUsername = clerkUser.username || clerkUser.firstName || `user_${clerkId.substring(0, 5)}`;
        finalUsername = finalUsername.replace(/\s+/g, '_');
        
        // Ensure uniqueness
        const existing = await this.usersService.findByUsername(finalUsername);
        if (existing) {
          finalUsername = `${finalUsername}_${Math.floor(Math.random() * 10000)}`;
        }
        
        const email = clerkUser.emailAddresses && clerkUser.emailAddresses.length > 0 
          ? clerkUser.emailAddresses[0].emailAddress 
          : null;
        
        user = await this.usersService.create({
          clerkId,
          username: finalUsername,
          email,
          avatarUrl: clerkUser.imageUrl,
          isGuest: false,
        });
      }

      // Attach user to socket. Game engine expects 'sub' to be the internal user.id
      client.data.user = { ...user, sub: user.id };
    } catch (err) {
      console.log('WsClerkAuthGuard: Token verification failed', err);
      throw new WsException('Unauthorized');
    }
    
    return true;
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    // Auth header format: Bearer <token>
    const [type, token] = client.handshake.auth?.token?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
