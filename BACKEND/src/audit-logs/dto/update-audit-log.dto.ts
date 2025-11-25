import { IsObject, IsOptional } from 'class-validator';

export class UpdateAuditLogDto {
  @IsOptional()
  @IsObject()
  metadata?: Record<string, string | number | boolean | null>;
}
