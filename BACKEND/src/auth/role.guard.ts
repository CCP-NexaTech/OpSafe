import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtPayload } from 'src/types/auth/JwtStrategy'

@Injectable()
export class RoleGuard implements CanActivate {
  private allowedRoles: string[];

  constructor(allowedRoles: string[]) {
    this.allowedRoles = allowedRoles;
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!this.allowedRoles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission');
    }

    return true;
  }
}
