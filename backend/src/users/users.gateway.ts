import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsersService } from './users.service';

@WebSocketGateway()
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    constructor(
        private readonly usersService: UsersService
    ) { }

    async handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
    }

    @SubscribeMessage('login')
    async handleLogin(@MessageBody() { userId }: { userId: string }, @ConnectedSocket() client: Socket) {
        console.log(userId)
        client.join(userId);
        const user = await this.usersService.updateAvailability(userId, {
            available: true
        });
    }

    @SubscribeMessage('logout')
    async handleLogout(@MessageBody() { userId }: { userId: string }, @ConnectedSocket() client: Socket) {
        client.leave(userId);
        const user = await this.usersService.updateAvailability(userId, {
            available: false
        });
    }
}