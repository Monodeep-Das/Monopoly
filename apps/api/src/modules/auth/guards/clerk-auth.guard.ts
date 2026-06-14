import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { createClerkClient } from '@clerk/clerk-sdk-node';
import { UsersService } from '../../users/users.service';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private clerkClient: ReturnType<typeof createClerkClient>;

  constructor(private usersService: UsersService) {
    this.clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY || 'sk_test_mock' });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      console.error('ClerkAuthGuard: No token provided in header');
      throw new UnauthorizedException('No token provided');
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

      // Attach Prisma User to the request
      request.user = user;
      return true;
    } catch (err: any) {
      console.error('Clerk auth error details:');
      console.error('Error message:', err.message);
      console.error('Error object:', JSON.stringify(err, null, 2));
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
