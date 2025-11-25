import type {
  MaintenanceOrderStatus,
  MaintenanceOrderType,
} from '../../types/database/maintenanceOrders';

export interface MaintenanceOrderResponseDto {
  id: string;
  organizationId: string;
  equipmentId: string;
  type: MaintenanceOrderType;
  status: MaintenanceOrderStatus;
  openedAt: Date;
  closedAt: Date | null;
  description: string | null;
  nextDueAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
