import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ContractStatus } from '../../types/database/contracts';

export class MinEquipmentRuleResponseDto {
  @ApiPropertyOptional({
    example: '66d1c2a7f1b2c3d4e5f6a7c0',
    nullable: true,
    description: 'Post ID (MongoDB ObjectId) or null when not tied to a post.',
  })
  postId: string | null;

  @ApiProperty({
    example: '66d1c2a7f1b2c3d4e5f6a7d1',
    description: 'Equipment Type ID (MongoDB ObjectId).',
  })
  equipmentTypeId: string;

  @ApiProperty({
    example: 2,
    description: 'Minimum required quantity for this equipment type.',
  })
  quantityMin: number;
}

export class ContractResponseDto {
  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7b9' })
  id: string;

  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7b8' })
  organizationId: string;

  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a700' })
  clientId: string;

  @ApiProperty({ example: 'CTR-2025-001' })
  code: string;

  @ApiProperty({ example: 'Security staffing contract for events.' })
  description: string;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiPropertyOptional({ example: '2025-12-31T00:00:00.000Z', nullable: true })
  endDate: Date | null;

  @ApiProperty({ example: 'active' })
  status: ContractStatus;

  @ApiProperty({
    type: MinEquipmentRuleResponseDto,
    isArray: true,
    description: 'Minimum equipment rules applied to this contract.',
  })
  minEquipmentRules: MinEquipmentRuleResponseDto[];

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: false })
  isDeleted: boolean;
}
