import { ObjectId } from 'mongodb';
import { BaseDocument } from './common';
import type { EquipmentCurrentLocation } from './equipments';

export type AssignmentAction = 'checkout' | 'checkin' | 'transfer';

export interface Assignment extends BaseDocument {
  organizationId: ObjectId;
  equipmentId: ObjectId;
  fromLocation: EquipmentCurrentLocation;
  toLocation: EquipmentCurrentLocation;
  action: AssignmentAction;
  effectiveAt: Date;
  notes?: string | null;
}
