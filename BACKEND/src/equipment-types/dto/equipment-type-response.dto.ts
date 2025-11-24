import type { EquipmentTypeStatus } from '../../types/database/equipmentTypes';

export interface EquipmentTypeResponseDto {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  description?: string;
  status: EquipmentTypeStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
