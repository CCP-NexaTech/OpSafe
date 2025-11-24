import { IsOptional, IsString } from 'class-validator';
import type { UserRole } from '../../types/database/users';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  role?: UserRole;
}
