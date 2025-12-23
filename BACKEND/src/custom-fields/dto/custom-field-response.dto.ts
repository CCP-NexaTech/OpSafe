// BACKEND/src/custom-fields/dto/custom-field-response.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { CustomFieldDataType } from '../../types/database/customFields';

export class CustomFieldResponseDto {
  @ApiProperty({
    description: 'Custom field ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1caaaaaa',
  })
  id: string;

  @ApiProperty({
    description: 'Organization ID (MongoDB ObjectId).',
    example: '675f3f3b5b1f4a2d1cbbbbbb',
  })
  organizationId: string;

  @ApiProperty({
    description:
      'Target collection where this custom field applies (e.g., equipments, operators, contracts).',
    example: 'equipments',
  })
  targetCollection: string;

  @ApiProperty({
    description:
      'Stable key used to store the value for this custom field (machine-readable).',
    example: 'helmet_size',
  })
  fieldKey: string;

  @ApiProperty({
    description: 'Human-friendly label to display in UI.',
    example: 'Helmet Size',
  })
  label: string;

  @ApiProperty({
    description: 'Data type of the field.',
    example: 'string',
  })
  dataType: CustomFieldDataType;

  @ApiProperty({
    description: 'Whether this field is required.',
    example: false,
  })
  required: boolean;

  @ApiPropertyOptional({
    description:
      'Available options when dataType is select/multiSelect. Null when not applicable.',
    example: ['S', 'M', 'L', 'XL'],
    nullable: true,
    type: [String],
  })
  options: string[] | null;

  @ApiPropertyOptional({
    description: 'Optional help text to guide the user.',
    example: 'Select the correct helmet size for the operator.',
    nullable: true,
  })
  helpText: string | null;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2025-01-15T10:12:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2025-01-16T11:40:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Soft delete flag.',
    example: false,
  })
  isDeleted: boolean;
}
