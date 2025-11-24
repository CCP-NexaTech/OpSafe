import type { ContractStatus } from '../../types/database/contracts';

export interface MinEquipmentRuleResponseDto {
  postId: string | null;
  equipmentTypeId: string;
  quantityMin: number;
}

export interface ContractResponseDto {
  id: string;
  organizationId: string;
  clientId: string;
  code: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  status: ContractStatus;
  minEquipmentRules: MinEquipmentRuleResponseDto[];
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
