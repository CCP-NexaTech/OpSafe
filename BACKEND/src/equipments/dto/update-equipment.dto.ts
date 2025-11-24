import {
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  EquipmentLocationType,
  EquipmentStatus,
} from '../../types/database/equipments';

class UpdateEquipmentLocationDto {
  @IsEnum(['stock', 'post', 'operator', 'maintenanceProvider'])
  type: EquipmentLocationType;

  @IsOptional()
  @IsMongoId()
  refId?: string;
}

export class UpdateEquipmentDto {
  @IsOptional()
  @IsMongoId()
  equipmentTypeId?: string;

  @IsOptional()
  @IsString()
  serialNumber?: string;

  @IsOptional()
  @IsString()
  assetTag?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateEquipmentLocationDto)
  currentLocation?: UpdateEquipmentLocationDto;

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
