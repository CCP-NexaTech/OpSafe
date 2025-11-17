import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export type ContractStatus = 'active' | 'expired' | 'cancelled';

export interface Contract extends BaseDocument {
  organizationId: ObjectId;
  clientId: ObjectId;
  status: ContractStatus;
  validUntil: Date;
}
