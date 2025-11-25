import { ObjectId } from 'mongodb';
import { BaseDocument } from './common';

export type MaintenanceOrderType = 'preventive' | 'corrective';

export type MaintenanceOrderStatus =
  | 'open'
  | 'inprogress'
  | 'closed'
  | 'cancelled';

export interface MaintenanceOrder extends BaseDocument {
  organizationId: ObjectId;
  equipmentId: ObjectId;
  type: MaintenanceOrderType;
  status: MaintenanceOrderStatus;
  openedAt: Date;
  closedAt: Date | null;
  description?: string | null;
  nextDueAt?: Date | null;
}
