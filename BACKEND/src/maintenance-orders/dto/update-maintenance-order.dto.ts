import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
} from 'class-validator';
import type {
  MaintenanceOrderStatus,
  MaintenanceOrderType,
} from '../../types/database/maintenanceOrders';

export class UpdateMaintenanceOrderDto {
  @IsOptional()
  @IsEnum(['preventive', 'corrective'])
  type?: MaintenanceOrderType;

  @IsOptional()
  @IsEnum(['open', 'inprogress', 'closed', 'cancelled'])
  status?: MaintenanceOrderStatus;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsDateString()
  openedAt?: string;

  @IsOptional()
  @IsDateString()
  closedAt?: string;

  @IsOptional()
  @IsDateString()
  nextDueAt?: string;
}
