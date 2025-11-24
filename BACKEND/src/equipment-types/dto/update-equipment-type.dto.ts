import { IsOptional, IsString, IsEnum } from 'class-validator';
import type { EquipmentTypeStatus } from '../../types/database/equipmentTypes';

export class UpdateEquipmentTypeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: EquipmentTypeStatus;
}
