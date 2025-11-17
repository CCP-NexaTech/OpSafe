import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export interface AuditLog extends BaseDocument {
  organizationId: ObjectId;
  entityType: string;
  entityId: ObjectId;
  action: string;
  createdAt: Date;
}
