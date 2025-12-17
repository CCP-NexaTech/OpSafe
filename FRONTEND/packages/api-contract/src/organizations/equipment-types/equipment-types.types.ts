export type EquipmentTypeStatus = "active" | "inactive";

export interface EquipmentType {
  id: string;
  organizationId: string;

  name: string;
  description: string | null;

  requiresSerialNumber: boolean;

  status: EquipmentTypeStatus;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateEquipmentTypeInput {
  name: string;
  description?: string;
  requiresSerialNumber?: boolean;
}

export type UpdateEquipmentTypeInput = Partial<CreateEquipmentTypeInput> & {
  status?: EquipmentTypeStatus;
};
