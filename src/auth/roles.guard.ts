import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtPayload } from './auth.types';
import { ROLES_KEY } from './auth.constants';

type AuthenticatedRequest = Request & { user: JwtPayload };

// Rejects authenticated users whose role is not allowed by route metadata.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<JwtPayload['role'][]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return roles.includes(request.user.role);
  }
}
