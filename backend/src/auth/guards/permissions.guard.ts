import { CanActivate, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from '../interfaces/jwt-payload.interface';
import { UserSub } from '../interfaces/user-sub.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/domain/entities/User';
import { DataSource, Repository } from 'typeorm';
import { Profile } from 'src/domain/entities/Profile';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private dataSource: DataSource,
  ) { }
  async canActivate(context: any): Promise<boolean> {
    const requiredPermissions =
      this.reflector.getAllAndMerge<String[]>('permissions', [
        context.getClass(),
        context.getHandler(),
      ]) || [];

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest() as Request;
    const [, token] = request.headers.authorization.split(' ');
    const decodedToken = verify(token, process.env.APP_SECRET) as jwtPayload;
    const decoded = JSON.parse(decodedToken.sub) as UserSub;
    const profile = await this.dataSource.manager.findOne(Profile,{
      where: {
        id: decoded.profileId,
      },
      relations: {
        permissions: true,
      },
    });

    return requiredPermissions.every(permission =>
      profile.permissions.some(userPermission => userPermission.name === permission),
    );
  }
}
