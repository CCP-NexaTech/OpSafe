import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export type AlertSeverity = 'low' | 'medium' | 'high';

export interface Alert extends BaseDocument {
  organizationId: ObjectId;
  type: string;
  severity: AlertSeverity;
  message: string;
  createdAt: Date;
}
