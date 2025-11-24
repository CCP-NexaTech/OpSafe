import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ContractStatus } from '../../types/database/contracts';

class MinEquipmentRuleUpdateDto {
  @IsOptional()
  @IsMongoId()
  postId?: string | null;

  @IsMongoId()
  @IsOptional()
  equipmentTypeId?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantityMin?: number;
}

export class UpdateContractDto {
  @IsOptional()
  @IsMongoId()
  clientId?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['draft', 'active', 'terminated'])
  status?: ContractStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MinEquipmentRuleUpdateDto)
  minEquipmentRules?: MinEquipmentRuleUpdateDto[];
}
