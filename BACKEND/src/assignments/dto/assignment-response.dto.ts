import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AssignmentAction } from '../../types/database/assignments';
import type { EquipmentLocationType } from '../../types/database/equipments';

export class AssignmentLocationResponseDto {
  @ApiProperty({
    description: 'Location type for this assignment.',
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

export class AssignmentResponseDto {
  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7fa' })
  id: string;

  @ApiProperty({ example: '66d1c2a7f1b2c3d4e5f6a7b8' })
  organizationId: string;

  @ApiProperty({
    description: 'Equipment ID related to this assignment.',
    example: '66d1c2a7f1b2c3d4e5f6a7ee',
  })
  equipmentId: string;

  @ApiProperty({
    description: 'Origin location before the assignment action.',
    type: AssignmentLocationResponseDto,
  })
  fromLocation: AssignmentLocationResponseDto;

  @ApiProperty({
    description: 'Destination location after the assignment action.',
    type: AssignmentLocationResponseDto,
  })
  toLocation: AssignmentLocationResponseDto;

  @ApiProperty({
    description: 'Action performed in this assignment event.',
    example: 'move',
  })
  action: AssignmentAction;

  @ApiProperty({
    description: 'When this assignment action becomes effective.',
    example: '2025-12-23T12:00:00.000Z',
  })
  effectiveAt: Date;

  @ApiPropertyOptional({
    description: 'Additional notes about this assignment event.',
    example: 'Moved to post due to contract start.',
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
