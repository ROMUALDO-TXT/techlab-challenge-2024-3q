import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from './conversations.service';
import { AddMessageDto } from './dto/add-message.dto';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt-auth.guard';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer()
    server: Server;

    constructor(
        private readonly conversationsService: ConversationsService
    ) { }
    
    @UseGuards(WsJwtGuard)
    async handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
    }
    
    @UseGuards(WsJwtGuard)
    @SubscribeMessage('sendMessage')
    async handleMessage(@MessageBody() message: AddMessageDto, @ConnectedSocket() client: Socket) {
        console.log('Message received:', message)
        const savedMessage = await this.conversationsService.addMessage(message);
        this.server.to(savedMessage.data.conversation.id).emit('message', savedMessage);
    }
}