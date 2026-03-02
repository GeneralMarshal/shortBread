import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ROLES_KEY } from '../decorators/roles.decorators';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.get<string[]>(ROLES_KEY, context.getHandler()) ?? null;

    if (!requiredRoles || requiredRoles.length === 0) {
      return true; //this means no particular roles required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as { role: 'ADMIN' | 'USER' };

    if (!user) {
      throw new ForbiddenException('No authenticated user found');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
