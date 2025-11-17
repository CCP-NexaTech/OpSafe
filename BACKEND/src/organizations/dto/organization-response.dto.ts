import type { OrganizationStatus } from '../../types/database/organizations';

export interface OrganizationResponseDto {
  id: string;
  name: string;
  document?: string;
  status: OrganizationStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
