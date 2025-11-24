import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  EquipmentLocationType,
  EquipmentStatus,
} from '../../types/database/equipments';

class EquipmentLocationDto {
  @IsEnum(['stock', 'post', 'operator', 'maintenanceProvider'])
  type: EquipmentLocationType;

  @IsOptional()
  @IsMongoId()
  refId?: string;
}

export class CreateEquipmentDto {
  @IsMongoId()
  @IsNotEmpty()
  equipmentTypeId: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsString()
  @IsNotEmpty()
  assetTag: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EquipmentLocationDto)
  currentLocation?: EquipmentLocationDto;

  @IsOptional()
  @IsEnum(['available', 'inuse', 'inmaintenance', 'decommissioned', 'lost'])
  status?: EquipmentStatus;

  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @IsOptional()
  @IsDateString()
  warrantyExpiresAt?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsMongoId()
  contractId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
