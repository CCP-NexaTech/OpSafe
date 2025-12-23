import { ApiProperty } from '@nestjs/swagger';
import type { UserRole, UserStatus } from '../../types/database/users';

export class LoginUserDto {
  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7c9' })
  id!: string;

  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7b8' })
  organizationId!: string;

  @ApiProperty({ example: 'user@opsafe.com' })
  email!: string;

  @ApiProperty({ example: 'John Doe' })
  name!: string;

  @ApiProperty({
    example: 'admin',
    enum: ['admin', 'manager', 'viewer'],
  })
  role!: UserRole;

  @ApiProperty({
    example: 'active',
    enum: ['pending', 'active', 'inactive'],
  })
  status!: UserStatus;
}

export class LoginResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  })
  accessToken!: string;

  @ApiProperty({
    example: 'bearer',
    description: 'Token type (lowercase, as returned by the API).',
  })
  tokenType!: 'bearer';

  @ApiProperty({
    example: 3600,
    description: 'Token expiration time in seconds',
  })
  expiresIn!: number;

  @ApiProperty({ type: LoginUserDto })
  user!: LoginUserDto;
}
