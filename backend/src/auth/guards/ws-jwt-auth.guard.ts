import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const client: Socket = context.switchToWs().getClient();
        if (!client.handshake) throw new UnauthorizedException('Authentication token missing');
        const token = client.handshake.auth.token;

        if (!token) {
            throw new UnauthorizedException('Authentication token missing');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token.split(" ")[1] as string);
            client.data.user = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}