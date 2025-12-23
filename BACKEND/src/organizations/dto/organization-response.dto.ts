import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { OrganizationStatus } from '../../types/database/organizations';

export class OrganizationResponseDto {
  @ApiProperty({
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
    description: 'Organization ID',
  })
  id!: string;

  @ApiProperty({
    example: 'OpSafe Tecnologia',
  })
  name!: string;

  @ApiPropertyOptional({
    example: '00.000.000/0001-00',
  })
  document?: string;

  @ApiProperty({
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status!: OrganizationStatus;

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
