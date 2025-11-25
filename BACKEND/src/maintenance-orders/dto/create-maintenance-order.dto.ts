import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';
import type { MaintenanceOrderType } from '../../types/database/maintenanceOrders';

export class CreateMaintenanceOrderDto {
  @IsMongoId()
  @IsNotEmpty()
  equipmentId: string;

  @IsEnum(['preventive', 'corrective'])
  type: MaintenanceOrderType;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsDateString()
  openedAt?: string;

  @IsOptional()
  @IsDateString()
  nextDueAt?: string;
}
