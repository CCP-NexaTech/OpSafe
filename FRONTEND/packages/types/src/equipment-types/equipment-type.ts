import type { BaseEntity, EntityId } from "../common";

export type EquipmentTypeStatus = "active" | "inactive";

export interface EquipmentType extends BaseEntity {
  organizationId: EntityId;

  name: string;
  description: string | null;

  status: EquipmentTypeStatus;
}

export type EquipmentTypeId = EntityId;
