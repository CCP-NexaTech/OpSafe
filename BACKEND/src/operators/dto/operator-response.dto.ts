import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { OperatorStatus } from '../../types/database/operators';

export class OperatorResponseDto {
  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7b9' })
  id: string;

  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7b8' })
  organizationId: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'OP-001' })
  identifierCode: string;

  @ApiPropertyOptional({ example: 'security' })
  role?: string;

  @ApiPropertyOptional({ example: '+55 85 99999-9999' })
  phone?: string;

  @ApiPropertyOptional({ example: 'john.doe@company.com' })
  email?: string;

  @ApiPropertyOptional({ example: '66d1c2a7f1b2c3d4e5f6a7c0' })
  postId?: string;

  @ApiPropertyOptional({ example: 'night' })
  shift?: string;

  @ApiPropertyOptional({ example: '1234' })
  documentLastDigits?: string;

  @ApiProperty({ example: 'active' })
  status: OperatorStatus;

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: false })
  isDeleted: boolean;
}
