import type { BaseEntity, EntityId, IsoDateString } from "../common";

export type EquipmentStatus =
  | "available"
  | "assigned"
  | "maintenance"
  | "inactive";

export interface Equipment extends BaseEntity {
  organizationId: EntityId;

  equipmentTypeId: EntityId;

  serialNumber: string | null;
  patrimonyCode: string | null;

  acquisitionDate: IsoDateString | null;

  status: EquipmentStatus;
}

export type EquipmentId = EntityId;
