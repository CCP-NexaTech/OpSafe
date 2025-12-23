import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  EquipmentLocationType,
  EquipmentStatus,
} from '../../types/database/equipments';

export class EquipmentLocationResponseDto {
  @ApiProperty({
    description: 'Location type for the equipment.',
    example: 'warehouse',
  })
  type: EquipmentLocationType;

  @ApiPropertyOptional({
    description:
      'Reference ID related to the location type (e.g., postId, operatorId, contractId). Null when not applicable.',
    example: '66d1c2a7f1b2c3d4e5f6a7aa',
    nullable: true,
  })
  refId: string | null;
}

export class EquipmentResponseDto {
  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7ee' })
  id: string;

  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7b8' })
  organizationId: string;

  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7c9' })
  equipmentTypeId: string;

  @ApiPropertyOptional({
    description: 'Manufacturer serial number (if available).',
    example: 'SN-AX12-00918',
    nullable: true,
  })
  serialNumber: string | null;

  @ApiProperty({
    description: 'Asset tag used for internal tracking.',
    example: 'ASSET-000123',
  })
  assetTag: string;

  @ApiProperty({
    description: 'Current equipment status.',
    example: 'available',
  })
  status: EquipmentStatus;

  @ApiProperty({
    description: 'Current equipment location information.',
    type: EquipmentLocationResponseDto,
  })
  currentLocation: EquipmentLocationResponseDto;

  @ApiPropertyOptional({
    description: 'Purchase date (if available).',
    example: '2025-01-10T00:00:00.000Z',
    nullable: true,
  })
  purchaseDate: Date | null;

  @ApiPropertyOptional({
    description: 'Warranty expiration date (if available).',
    example: '2026-01-10T00:00:00.000Z',
    nullable: true,
  })
  warrantyExpiresAt: Date | null;

  @ApiPropertyOptional({
    description: 'Equipment validity date (if applicable).',
    example: '2026-12-31T00:00:00.000Z',
    nullable: true,
  })
  validUntil: Date | null;

  @ApiPropertyOptional({
    description: 'Contract ID associated with this equipment (if assigned).',
    example: '66d1c2a7f1b2c3d4e5f6a7b9',
    nullable: true,
  })
  contractId: string | null;

  @ApiPropertyOptional({
    description: 'Additional notes about the equipment.',
    example: 'Battery replaced in Nov/2025.',
    nullable: true,
  })
  notes: string | null;

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: false })
  isDeleted: boolean;
}
