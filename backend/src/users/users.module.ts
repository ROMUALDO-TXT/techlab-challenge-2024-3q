import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { UsersGateway } from './users.gateway';

@Module({
  imports: [JwtModule],
  controllers: [UsersController],
  providers: [UsersService, UsersGateway],
})
export class UsersModule {}
