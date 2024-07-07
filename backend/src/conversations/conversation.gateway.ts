import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from './conversations.service';
import { AddMessageDto } from './dto/add-message.dto';
import { Get, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from 'src/auth/guards/ws-jwt-auth.guard';
import { Cron } from '@nestjs/schedule';
import { Public } from 'src/auth/decorators/public.decorator';

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

        this.server.emit('lastMessage', {
            id: savedMessage.data.id,
            content: savedMessage.data.content,
            by: savedMessage.data.by,
            conversationId: savedMessage.data.conversation.id,
            createdAt: savedMessage.data.createdAt,
        });
    }

    @Cron('30 * * * * *')
    async sendQueueCount() {
        const queueSize = (await this.conversationsService.conversationQueue()).data
        this.server.emit('queueCount', { queueSize: queueSize });
    }

    @Cron('0 */1 * * * *')
    async distributeQueue() {
        const messages = await this.conversationsService.distributeQueue();
        if (messages.data.length > 0) {
            messages.data.forEach(message => {
                this.server.emit('userAssigned', {
                    conversationId: message.conversation.id,
                    userId: message.conversation.user.id
                })
                this.server.emit('lastMessage', {
                    id: message.id,
                    content: message.content,
                    by: message.by,
                    conversationId: message.conversation.id,
                    createdAt: message.createdAt,
                })
            })
        }
    }
}