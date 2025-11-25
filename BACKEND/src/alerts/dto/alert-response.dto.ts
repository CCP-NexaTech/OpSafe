import type {
  AlertSeverity,
  AlertType,
} from '../../types/database/alerts';

export interface AlertResponseDto {
  id: string;
  organizationId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  equipmentId: string | null;
  operatorId: string | null;
  contractId: string | null;
  resolvedAt: Date | null;
  resolvedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
