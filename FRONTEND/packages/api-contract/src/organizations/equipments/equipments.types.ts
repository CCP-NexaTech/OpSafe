export type EquipmentStatus = "available" | "assigned" | "maintenance" | "inactive";

export interface Equipment {
  id: string;
  organizationId: string;

  equipmentTypeId: string;

  name: string;
  serialNumber: string | null;

  purchaseDate: string | null;
  warrantyEndDate: string | null;

  status: EquipmentStatus;

  notes: string | null;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateEquipmentInput {
  equipmentTypeId: string;
  name: string;
  serialNumber?: string;

  purchaseDate?: string;
  warrantyEndDate?: string;

  notes?: string;
}

export type UpdateEquipmentInput = Partial<CreateEquipmentInput> & {
  status?: EquipmentStatus;
};
