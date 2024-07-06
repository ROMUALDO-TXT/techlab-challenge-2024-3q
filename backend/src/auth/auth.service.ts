import { Inject, Injectable, Post, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { jwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from 'src/domain/entities/User';
import { Profiles } from 'src/domain/constants/profiles';
import { UserSub } from './interfaces/user-sub.interface';
import { Consumer } from 'src/domain/entities/Consumer';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService
  ) { }

  async loginBackOffice({ email, password }: LoginDto) {
    const user = await this.dataSource.manager.findOne(User, {
      where: {
        email: email
      }
    });

    if (!user) {
      throw new UnauthorizedException(`Email não encontrado.`);
    }

    if (user.profile === 'consumer' as Profiles) throw new UnauthorizedException(`Nível de acesso inválido.`);

    const confirmPassword = await compare(password, user.password);

    if (!confirmPassword) {
      throw new UnauthorizedException(`Senha incorreta`);
    }

    delete user.password;

    return {
      status: 200,
      token: this.signToken(user),
      data: {
        id: user.id,
        email: user.email,
        profileId: user.profile,
        username: user.username,
      }
    };
  }

  async loginChat({ email, password }: LoginDto) {
    const consumer = await this.dataSource.manager.findOne(Consumer, {
      where: {
        email: email
      }
    });

    if (!consumer) {
      throw new UnauthorizedException(`Email não encontrado.`);
    }

    const confirmPassword = await compare(password, consumer.password);

    if (!confirmPassword) {
      throw new UnauthorizedException(`Senha incorreta`);
    }

    delete consumer.password;

    return {
      status: 200,
      token: this.signToken(consumer),
      data: {
        id: consumer.id,
        email: consumer.email,
        profile: consumer.profile,
        name: consumer.firstName,
      }
    }
  }


  signToken(user: User | Consumer) {
    const subject = {
      sub: JSON.stringify({
        id: user.id,
        email: user.email,
        profile: user.profile,
      }),
    };
    return this.jwtService.sign(subject);
  }

  async verifyPayload(payload: jwtPayload) {
    const decoded = JSON.parse(payload.sub) as UserSub;
    if (decoded.profile != "consumer") {
      const user = await this.dataSource.manager.findOne(User, {
        where: {
          id: decoded.id,
          email: decoded.email
        }
      });
      if (!user) {
        throw new UnauthorizedException(`Token inválido`);
      }

      delete user.password;

      return user;
    } else {

      const consumer = await this.dataSource.manager.findOne(Consumer, {
        where: {
          id: decoded.id,
          email: decoded.email
        }
      });
      if (!consumer) {
        throw new UnauthorizedException(`Token inválido`);
      }

      delete consumer.password;

      return consumer;
    }
  }
}
