import type { AlertSeverity, AlertType } from "@opsafe/types";

export interface Alert {
  id: string;
  organizationId: string;

  type: AlertType;
  severity: AlertSeverity;

  message: string;

  equipmentId: string | null;
  operatorId: string | null;
  contractId: string | null;

  resolvedAt: string | null;
  resolvedByUserId: string | null;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateAlertInput {
  type: AlertType;
  severity: AlertSeverity;
  message: string;

  equipmentId?: string;
  operatorId?: string;
  contractId?: string;

  resolvedAt?: string;
  resolvedByUserId?: string;
}

export type UpdateAlertInput = Partial<CreateAlertInput>;
