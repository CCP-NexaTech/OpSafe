import { ApiProperty } from '@nestjs/swagger';
import type { UserRole, UserStatus } from '../../types/database/users';

export class UserResponseDto {
  @ApiProperty({
    example: '66d1c2a7f1b2c3d4e5f6a7c9',
    description: 'User ID',
  })
  id!: string;

  @ApiProperty({
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
    description: 'Organization ID',
  })
  organizationId!: string;

  @ApiProperty({
    example: 'user@opsafe.com',
  })
  email!: string;

  @ApiProperty({
    example: 'John Doe',
  })
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

  @ApiProperty({
    example: '2025-12-22T13:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2025-12-22T13:30:00.000Z',
    type: String,
    format: 'date-time',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: false,
  })
  isDeleted!: boolean;
}
