import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './domain/entities/User';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './auth/guards/permissions.guard';
import { TimingMiddleware } from './domain/middlewares/timmingMiddleware';
import { Conversation } from './domain/entities/Conversation';
import { ConversationMessage } from './domain/entities/ConversationMessage';
import { Consumer } from './domain/entities/Consumer';
import { ConversationsModule } from './conversations/conversations.module';
import { ConsumersModule } from './consumers/consumers.module';
import { JwtModule } from '@nestjs/jwt';
import { WsJwtGuard } from './auth/guards/ws-jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: Number(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASS,
      database: process.env.DATABASE_NAME,
      entities: [
        User,
        Consumer,
        Conversation,
        ConversationMessage,
      ],
      logging: false,
      synchronize: true,
    }),
    WinstonModule.forRoot({
      format: format.combine(format.timestamp(), format.prettyPrint()),
      transports: [
        new transports.File({
          filename: `logs-${new Date(Date.now()).getMonth() + 1}-${new Date(Date.now()).getFullYear()}.log`,
          dirname: `${process.cwd()}/logs/info`,
          level: "info",
          handleExceptions: true,
        }),
        new transports.File({
          filename: `errors-${new Date(Date.now()).getMonth() + 1}-${new Date(Date.now()).getFullYear()}.log`,
          dirname: `${process.cwd()}/logs/errors`,
          level: "error",
        }),
      ],
      exceptionHandlers: [
        new transports.File({
          filename: `exceptions-${new Date(Date.now()).getMonth() + 1}-${new Date(Date.now()).getFullYear()}.log`,
          dirname: `${process.cwd()}/logs/exceptions`
        })

      ],
    }),
    AuthModule,
    UsersModule,
    ConversationsModule,
    ConsumersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TimingMiddleware)
      .forRoutes('*');
  }
}
