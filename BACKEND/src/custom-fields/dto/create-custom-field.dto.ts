import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type { CustomFieldDataType } from '../../types/database/customFields';

const CUSTOM_FIELD_DATA_TYPES: CustomFieldDataType[] = [
  'string',
  'number',
  'boolean',
  'date',
  'select',
];

export class CreateCustomFieldDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  targetCollection: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fieldKey: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  label: string;

  @IsString()
  @IsIn(CUSTOM_FIELD_DATA_TYPES)
  dataType: CustomFieldDataType;

  @IsBoolean()
  required: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  helpText?: string;
}
