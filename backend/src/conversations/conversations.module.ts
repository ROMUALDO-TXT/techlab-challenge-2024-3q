import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { ChatGateway } from './conversation.gateway';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.APP_SECRET,
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [ConversationsController],
  providers: [ConversationsService, ChatGateway],
})
export class ConversationsModule { }
