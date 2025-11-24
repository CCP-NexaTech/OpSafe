import type {
  EquipmentLocationType,
  EquipmentStatus,
} from '../../types/database/equipments';

export interface EquipmentLocationResponseDto {
  type: EquipmentLocationType;
  refId: string | null;
}

export interface EquipmentResponseDto {
  id: string;
  organizationId: string;
  equipmentTypeId: string;
  serialNumber: string | null;
  assetTag: string;
  status: EquipmentStatus;
  currentLocation: EquipmentLocationResponseDto;
  purchaseDate: Date | null;
  warrantyExpiresAt: Date | null;
  validUntil: Date | null;
  contractId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
