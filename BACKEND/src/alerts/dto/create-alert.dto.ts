import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import type {
  AlertSeverity,
  AlertType,
} from '../../types/database/alerts';

export class CreateAlertDto {
  @IsEnum(['epiExpiry', 'lateReturn', 'maintenanceDue', 'stockLow'])
  type: AlertType;

  @IsEnum(['info', 'warning', 'critical'])
  severity: AlertSeverity;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  message: string;

  @IsOptional()
  @IsMongoId()
  equipmentId?: string;

  @IsOptional()
  @IsMongoId()
  operatorId?: string;

  @IsOptional()
  @IsMongoId()
  contractId?: string;

  @IsOptional()
  @IsMongoId()
  resolvedByUserId?: string;

  @IsOptional()
  @IsString()
  resolvedAt?: string;
}
