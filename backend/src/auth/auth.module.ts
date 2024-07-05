import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CpfValidation } from './dto/cpf-validation';
import { EmailValidation } from './dto/email-validation';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
        PassportModule,
        ConfigModule.forRoot({
            envFilePath: `${process.cwd()}/.env.${process.env.NODE_ENV}`,
        }),
        JwtModule.register({
            secret: process.env.APP_SECRET,
            signOptions: { expiresIn: '12h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, EmailValidation, CpfValidation],
    exports: [CpfValidation, EmailValidation],
})
export class AuthModule { }
