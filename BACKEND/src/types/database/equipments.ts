import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export type EquipmentStatus = 'active' | 'maintenance' | 'retired';

export interface Equipment extends BaseDocument {
  organizationId: ObjectId;
  equipmentTypeId: ObjectId;
  assetTag: string;
  validUntil: Date;
  status: EquipmentStatus;
}
