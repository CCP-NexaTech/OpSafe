import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export type OperatorStatus = 'active' | 'inactive';

export interface Operator extends BaseDocument {
  organizationId: ObjectId;
  name: string;
  identifierCode: string;
  status: OperatorStatus;
}
