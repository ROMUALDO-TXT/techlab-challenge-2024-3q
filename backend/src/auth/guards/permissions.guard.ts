import { CanActivate, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from '../interfaces/jwt-payload.interface';
import { UserSub } from '../interfaces/user-sub.interface';
import { Profiles } from 'src/domain/constants/profiles';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  async canActivate(context: any): Promise<boolean> {
    const roles =
      this.reflector.getAllAndMerge<Profiles[]>('profiles', [
        context.getClass(),
        context.getHandler(),
      ]) || [];

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles || isPublic) {
      return true;
    }

    let isAllowed = false;

    const request = context.switchToHttp().getRequest() as Request;
    const [, token] = request.headers.authorization.split(' ');
    const decodedToken = verify(token, process.env.APP_SECRET) as jwtPayload;
    const decoded = JSON.parse(decodedToken.sub) as UserSub;

    if (roles.includes(decoded.profile as Profiles)) {
      isAllowed = true;
    }

    return isAllowed;
  }
}
