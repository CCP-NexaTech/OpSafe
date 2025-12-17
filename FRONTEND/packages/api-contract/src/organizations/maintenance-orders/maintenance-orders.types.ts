export type MaintenanceOrderStatus =
  | "open"
  | "inProgress"
  | "waitingParts"
  | "done"
  | "canceled";

export type MaintenanceOrderPriority = "low" | "medium" | "high" | "critical";

export interface MaintenanceOrder {
  id: string;
  organizationId: string;

  equipmentId: string;

  title: string;
  description: string | null;

  status: MaintenanceOrderStatus;
  priority: MaintenanceOrderPriority;

  dueAt: string | null;
  completedAt: string | null;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateMaintenanceOrderInput {
  equipmentId: string;
  title: string;
  description?: string;

  priority?: MaintenanceOrderPriority;
  status?: MaintenanceOrderStatus;

  dueAt?: string;
}

export type UpdateMaintenanceOrderInput = Partial<CreateMaintenanceOrderInput> & {
  completedAt?: string;
};
