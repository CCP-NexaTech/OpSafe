import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RoleGuard } from './role.guard';

export const Roles = (...roles: string[]) =>
  applyDecorators(
    UseGuards(JwtAuthGuard, new RoleGuard(roles)),
  );
