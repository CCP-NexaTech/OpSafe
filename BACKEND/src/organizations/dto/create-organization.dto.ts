import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import type { OrganizationStatus } from '../../types/database/organizations';

const ORGANIZATION_STATUS_VALUES: OrganizationStatus[] = ['active', 'inactive'];

export class CreateOrganizationDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsIn(ORGANIZATION_STATUS_VALUES)
  status?: OrganizationStatus;
}
