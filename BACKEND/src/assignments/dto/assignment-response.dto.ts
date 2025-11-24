import type {
  AssignmentAction,
} from '../../types/database/assignments';
import type { EquipmentLocationType } from '../../types/database/equipments';

export interface AssignmentLocationResponseDto {
  type: EquipmentLocationType;
  refId: string | null;
}

export interface AssignmentResponseDto {
  id: string;
  organizationId: string;
  equipmentId: string;
  fromLocation: AssignmentLocationResponseDto;
  toLocation: AssignmentLocationResponseDto;
  action: AssignmentAction;
  effectiveAt: Date;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
