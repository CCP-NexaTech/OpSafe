import { ObjectId } from 'mongodb';
import { BaseDocument } from './common';

export type OperatorStatus = 'active' | 'inactive';

export interface Operator extends BaseDocument {
  organizationId: ObjectId;

  name: string;
  identifierCode: string;

  phone?: string;
  email?: string;

  role?: string;
  postId?: ObjectId;
  shift?: string;

  documentLastDigits?: string;

  status: OperatorStatus;
}
