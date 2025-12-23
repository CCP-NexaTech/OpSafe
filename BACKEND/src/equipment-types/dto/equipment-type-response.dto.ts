import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EquipmentTypeStatus } from 'src/types/database'

export class EquipmentTypeResponseDto {
  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7c9' })
  id: string;

  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7b8' })
  organizationId: string;

  @ApiProperty({ example: 'Radio communicator' })
  name: string;

  @ApiProperty({ example: 'Communication' })
  category: string;

  @ApiPropertyOptional({
    example: 'Portable radio communication equipment',
  })
  description?: string;

  @ApiProperty({ example: 'active' })
  status: EquipmentTypeStatus;

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-23T12:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ example: false })
  isDeleted: boolean;
}
