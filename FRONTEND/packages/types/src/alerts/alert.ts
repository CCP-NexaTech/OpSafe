import type { BaseEntity, EntityId, IsoDateString } from "../common";

export type AlertType = 'epiExpiry' | 'lateReturn' | 'maintenanceDue' | 'stockLow';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert extends BaseEntity {
  organizationId: EntityId;

  type: AlertType;
  severity: AlertSeverity;

  message: string;

  equipmentId: EntityId | null;
  operatorId: EntityId | null;
  contractId: EntityId | null;

  resolvedAt: IsoDateString | null;
  resolvedByUserId: EntityId | null;
}

export type AlertId = EntityId;
