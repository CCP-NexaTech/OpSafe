import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import type { UserRole } from '../../types/database/users';

const USER_ROLES: UserRole[] = ['admin', 'manager', 'viewer'];

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsIn(USER_ROLES)
  role?: UserRole;
}
