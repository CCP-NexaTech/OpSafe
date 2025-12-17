import type { BaseEntity, EntityId, IsoDateString } from "../common";

export type AssignmentStatus = "active" | "returned" | "canceled";

export interface Assignment extends BaseEntity {
  organizationId: EntityId;

  operatorId: EntityId;
  equipmentId: EntityId;

  assignedAt: IsoDateString;
  expectedReturnAt: IsoDateString | null;
  returnedAt: IsoDateString | null;

  status: AssignmentStatus;

  notes: string | null;
}

export type AssignmentId = EntityId;
