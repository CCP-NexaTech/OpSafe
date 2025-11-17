import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export interface EquipmentType extends BaseDocument {
  organizationId: ObjectId;
  name: string;
  category: string;
}
