import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export interface Term extends BaseDocument {
  organizationId: ObjectId;
  operatorId: ObjectId;
  fileUrl: string;
  signedAt: Date | null;
}
