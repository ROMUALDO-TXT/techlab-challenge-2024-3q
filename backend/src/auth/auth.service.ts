import { Inject, Injectable, Post, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { jwtPayload } from './interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { DataSource } from 'typeorm';
import { User } from 'src/domain/entities/User';
import { profiles } from 'src/domain/constants/profiles';
import { UserSub } from './interfaces/user-sub.interface';
import { Consumer } from 'src/domain/entities/Consumer';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService
  ) { }

  async login({ email, password }: LoginDto) {
    const user = await this.dataSource.manager.findOne(User, {
      where: {
        email: email
      }
    });

    if (!user) {
      throw new UnauthorizedException(`Email não encontrado.`);
    }

    const confirmPassword = await compare(password, user.password);

    if (!confirmPassword) {
      throw new UnauthorizedException(`Senha incorreta`);
    }

    const isConsumer = await this.dataSource.manager.findOne(Consumer, {
      where: {
        user: user,
      }
    });

    delete user.password;
    console.log(user);

    if (isConsumer) return {
      token: this.signToken(user),
      id: user.id,
      email: user.email,
      profileId: user.profile.id,
      username: isConsumer.firstName + " " + isConsumer.lastName,
      consumerId: isConsumer.id
    }


    return {
      status: 200,
      token: this.signToken(user),
      data: {
        id: user.id,
        email: user.email,
        profileId: user.profile.id,
        username: user.username,
      }
    };
  }

  signToken(user: User) {
    const subject = {
      sub: JSON.stringify({
        id: user.id,
        email: user.email,
        profileId: user.profile.id,
        username: user.username,
      }),
    };
    return this.jwtService.sign(subject);
  }

  async verifyPayload(payload: jwtPayload) {
    const decoded = JSON.parse(payload.sub) as UserSub;
    const user = await this.dataSource.manager.findOne(User, {
      where: {
        id: decoded.id,
        username: decoded.username,
        email: decoded.email
      }
    });
    if (!user) {
      throw new UnauthorizedException(`Token inválido`);
    }

    delete user.password;

    return user;
  }
}
