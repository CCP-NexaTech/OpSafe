import type {
  AuditLogAction,
  AuditLogEntityType,
} from '../../types/database/auditLogs';

export interface AuditLogResponseDto {
  id: string;
  organizationId: string;
  userId: string;
  action: AuditLogAction;
  entityType: AuditLogEntityType;
  entityId: string | null;
  ip: string | null;
  userAgent: string | null;
  metadata: Record<string, string | number | boolean | null> | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
