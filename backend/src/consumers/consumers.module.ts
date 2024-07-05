import { Module } from '@nestjs/common';
import { ConsumersService } from './consumers.service';
import { ConsumersController } from './consumers.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.APP_SECRET,
      signOptions: { expiresIn: '12h' },
    }),
  ],
  controllers: [ConsumersController],
  providers: [ConsumersService],
})
export class ConsumersModule { }
