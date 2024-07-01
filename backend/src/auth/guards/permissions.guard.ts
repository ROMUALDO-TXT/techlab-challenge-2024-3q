import { CanActivate, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { verify } from 'jsonwebtoken';
import { jwtPayload } from '../interfaces/jwt-payload.interface';
import { UserSub } from '../interfaces/user-sub.interface';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) { }
  
  async canActivate(context: any): Promise<boolean> {  
    const scopes =
      this.reflector.getAllAndMerge<String[]>('scopes', [
        context.getClass(),
        context.getHandler(),
      ]) || [];

    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest() as Request;
    const [, token] = request.headers.authorization.split(' ');
    const decodedToken = verify(token, process.env.APP_SECRET) as jwtPayload;
    const decoded = JSON.parse(decodedToken.sub) as UserSub;

    if (decoded.scopes.includes('*')) return true

    const isScopeAllowed = (scope: string) => decoded.scopes.includes(scope);
    
    return scopes.some(isScopeAllowed);
  }
}
