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

export class UpdateCustomFieldDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  targetCollection?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fieldKey?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  label?: string;

  @IsOptional()
  @IsString()
  @IsIn(CUSTOM_FIELD_DATA_TYPES)
  dataType?: CustomFieldDataType;

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(500)
  helpText?: string;
}
