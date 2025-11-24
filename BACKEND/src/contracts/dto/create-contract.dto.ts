import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ContractStatus } from '../../types/database/contracts';

class MinEquipmentRuleDto {
  @IsOptional()
  @IsMongoId()
  postId?: string | null;

  @IsMongoId()
  @IsNotEmpty()
  equipmentTypeId: string;

  @IsNumber()
  @Type(() => Number)
  quantityMin: number;
}

export class CreateContractDto {
  @IsMongoId()
  @IsNotEmpty()
  clientId: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(['draft', 'active', 'terminated'])
  status?: ContractStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MinEquipmentRuleDto)
  minEquipmentRules?: MinEquipmentRuleDto[];
}
