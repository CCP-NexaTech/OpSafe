import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export interface Assignment extends BaseDocument {
  organizationId: ObjectId;
  operatorId: ObjectId;
  equipmentId: ObjectId;
  createdAt: Date;
}
