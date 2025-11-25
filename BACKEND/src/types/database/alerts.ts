import { ObjectId } from 'mongodb';
import { BaseDocument } from './common';

export type AlertType =
  | 'epiExpiry'
  | 'lateReturn'
  | 'maintenanceDue'
  | 'stockLow';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert extends BaseDocument {
  organizationId: ObjectId;
  type: AlertType;
  severity: AlertSeverity;
  equipmentId?: ObjectId | null;
  operatorId?: ObjectId | null;
  contractId?: ObjectId | null;
  message: string;
  resolvedAt?: Date | null;
  resolvedByUserId?: ObjectId | null;
}
