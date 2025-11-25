import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  IsObject,
} from 'class-validator';
import type {
  AuditLogAction,
  AuditLogEntityType,
} from '../../types/database/auditLogs';

export class CreateAuditLogDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsEnum([
    'user.login',
    'user.logout',
    'user.invite',
    'user.acceptInvite',
    'user.update',
    'operator.create',
    'operator.update',
    'operator.delete',
    'client.create',
    'client.update',
    'client.delete',
    'contract.create',
    'contract.update',
    'contract.delete',
    'post.create',
    'post.update',
    'post.delete',
    'equipmentType.create',
    'equipmentType.update',
    'equipmentType.delete',
    'equipment.create',
    'equipment.update',
    'equipment.delete',
    'assignment.create',
    'assignment.complete',
    'maintenanceOrder.create',
    'maintenanceOrder.update',
    'alert.create',
    'alert.update',
    'term.create',
    'term.update',
    'term.delete',
  ])
  action: AuditLogAction;

  @IsEnum([
    'organization',
    'user',
    'operator',
    'client',
    'contract',
    'post',
    'equipmentType',
    'equipment',
    'assignment',
    'term',
    'maintenanceOrder',
    'alert',
  ])
  entityType: AuditLogEntityType;

  @IsOptional()
  @IsMongoId()
  entityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  ip?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  userAgent?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, string | number | boolean | null>;
}
