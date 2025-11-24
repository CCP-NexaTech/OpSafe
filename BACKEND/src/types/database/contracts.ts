import { ObjectId } from 'mongodb';
import { BaseDocument } from './common';

export type ContractStatus = 'draft' | 'active' | 'terminated';

export interface MinEquipmentRule {
  postId: ObjectId | null;
  equipmentTypeId: ObjectId;
  quantityMin: number;
}

export interface Contract extends BaseDocument {
  organizationId: ObjectId;
  clientId: ObjectId;
  code: string;
  description: string;
  startDate: Date;
  endDate: Date | null;
  status: ContractStatus;
  minEquipmentRules: MinEquipmentRule[];
}
