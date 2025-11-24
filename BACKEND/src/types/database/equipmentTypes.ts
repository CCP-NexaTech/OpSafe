import { ObjectId } from 'mongodb';
import { BaseDocument } from './common';

export type EquipmentTypeStatus = 'active' | 'inactive';

export interface EquipmentType extends BaseDocument {
  organizationId: ObjectId;
  name: string;
  category: string;
  description?: string;
  status: EquipmentTypeStatus;
}
