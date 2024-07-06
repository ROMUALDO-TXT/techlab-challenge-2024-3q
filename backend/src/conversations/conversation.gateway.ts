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

    async handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
    }

    @SubscribeMessage('typing')
    async handleTyping(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
        this.server.emit('isTyping', {
            conversationId: data.conversationId,
            user: data.user
        }) 
    }

    @UseGuards(WsJwtGuard)
    @SubscribeMessage('sendMessage')
    async handleMessage(@MessageBody() message: AddMessageDto, @ConnectedSocket() client: Socket) {
        const savedMessage = await this.conversationsService.addMessage(message);
        this.server.emit('message', {
            id: savedMessage.data.id,
            content: savedMessage.data.content,
            by: savedMessage.data.by,
            conversationId: savedMessage.data.conversation.id,
            createdAt: savedMessage.data.createdAt,
        });
    }
}