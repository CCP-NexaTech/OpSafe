import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export type MaintenanceStatus = 'open' | 'in_progress' | 'closed';

export interface MaintenanceOrder extends BaseDocument {
  organizationId: ObjectId;
  equipmentId: ObjectId;
  description: string;
  openedAt: Date;
  closedAt?: Date;
  status: MaintenanceStatus;
}
