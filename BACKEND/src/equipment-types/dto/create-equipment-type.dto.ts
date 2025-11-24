import { IsNotEmpty, IsOptional, IsString, IsEnum } from 'class-validator';
import type { EquipmentTypeStatus } from '../../types/database/equipmentTypes';

export class CreateEquipmentTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: EquipmentTypeStatus;
}
