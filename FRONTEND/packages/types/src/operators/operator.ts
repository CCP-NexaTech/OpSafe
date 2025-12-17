import type { BaseEntity, EntityId } from "../common";

export type OperatorStatus = "active" | "inactive";

export interface Operator extends BaseEntity {
  organizationId: EntityId;

  fullName: string;
  document: string | null;

  email: string | null;
  phone: string | null;

  status: OperatorStatus;
}

export type OperatorId = EntityId;
