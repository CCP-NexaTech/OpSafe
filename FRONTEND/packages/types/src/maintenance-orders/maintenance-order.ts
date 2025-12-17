import type { BaseEntity, EntityId, IsoDateString } from "../common";

export type MaintenanceOrderStatus =
  | "open"
  | "inProgress"
  | "waitingParts"
  | "done"
  | "canceled";

export type MaintenanceOrderPriority = "low" | "medium" | "high" | "critical";

export interface MaintenanceOrder extends BaseEntity {
  organizationId: EntityId;

  equipmentId: EntityId;

  title: string;
  description: string | null;

  status: MaintenanceOrderStatus;
  priority: MaintenanceOrderPriority;

  dueAt: IsoDateString | null;
  completedAt: IsoDateString | null;
}

export type MaintenanceOrderId = EntityId;
