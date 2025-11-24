import { IsOptional, IsString, IsMongoId } from 'class-validator';
import type { OperatorStatus } from '../../types/database/operators';

export class UpdateOperatorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  identifierCode?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsMongoId()
  postId?: string;

  @IsOptional()
  @IsString()
  shift?: string;

  @IsOptional()
  @IsString()
  documentLastDigits?: string;

  @IsOptional()
  status?: OperatorStatus;
}
