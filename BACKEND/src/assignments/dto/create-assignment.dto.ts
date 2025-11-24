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
import type { AssignmentAction } from '../../types/database/assignments';
import type { EquipmentLocationType } from '../../types/database/equipments';

class AssignmentLocationDto {
  @IsEnum(['stock', 'post', 'operator', 'maintenanceProvider'])
  type: EquipmentLocationType;

  @IsOptional()
  @IsMongoId()
  refId?: string;
}

export class CreateAssignmentDto {
  @IsMongoId()
  @IsNotEmpty()
  equipmentId: string;

  @IsEnum(['checkout', 'checkin', 'transfer'])
  action: AssignmentAction;

  @ValidateNested()
  @Type(() => AssignmentLocationDto)
  toLocation: AssignmentLocationDto;

  @IsOptional()
  @IsDateString()
  effectiveAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
