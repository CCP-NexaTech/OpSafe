import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  MaintenanceOrderStatus,
  MaintenanceOrderType,
} from '../../types/database/maintenanceOrders';

export class MaintenanceOrderResponseDto {
  @ApiProperty({
    description: 'Maintenance order ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7cd',
  })
  id: string;

  @ApiProperty({
    description: 'Organization ID (MongoDB ObjectId).',
    example: '66d1c2a7f1b2c3d4e5f6a7b8',
  })
  organizationId: string;

  @ApiProperty({
    description: 'Equipment ID related to this maintenance order.',
    example: '66d1c2a7f1b2c3d4e5f6a7ee',
  })
  equipmentId: string;

  @ApiProperty({
    description: 'Type of maintenance order.',
    example: 'preventive',
  })
  type: MaintenanceOrderType;

  @ApiProperty({
    description: 'Current maintenance order status.',
    example: 'open',
  })
  status: MaintenanceOrderStatus;

  @ApiProperty({
    description: 'When the maintenance order was opened.',
    example: '2025-03-01T09:00:00.000Z',
  })
  openedAt: Date;

  @ApiPropertyOptional({
    description: 'When the maintenance order was closed.',
    example: '2025-03-05T16:30:00.000Z',
    nullable: true,
  })
  closedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Description of the maintenance issue or task.',
    example: 'Routine inspection and battery replacement.',
    nullable: true,
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Next scheduled maintenance date (if applicable).',
    example: '2025-09-01T00:00:00.000Z',
    nullable: true,
  })
  nextDueAt: Date | null;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2025-03-01T09:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2025-03-05T16:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Soft delete flag.',
    example: false,
  })
  isDeleted: boolean;
}
