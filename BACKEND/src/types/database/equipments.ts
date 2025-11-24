import { ObjectId } from 'mongodb';
import { BaseDocument } from './common';

export type EquipmentStatus =
  | 'available'
  | 'inuse'
  | 'inmaintenance'
  | 'decommissioned'
  | 'lost';

export type EquipmentLocationType =
  | 'stock'
  | 'post'
  | 'operator'
  | 'maintenanceProvider';

export interface EquipmentCurrentLocation {
  type: EquipmentLocationType;
  refId: ObjectId | null;
}

export interface Equipment extends BaseDocument {
  organizationId: ObjectId;
  equipmentTypeId: ObjectId;
  serialNumber?: string | null;
  assetTag: string;
  status: EquipmentStatus;
  currentLocation: EquipmentCurrentLocation;
  purchaseDate?: Date | null;
  warrantyExpiresAt?: Date | null;
  validUntil?: Date | null;
  contractId?: ObjectId | null;
  notes?: string | null;
}
