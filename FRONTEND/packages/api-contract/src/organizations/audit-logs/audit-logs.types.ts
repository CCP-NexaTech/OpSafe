export type AuditLogEntity =
  | "organization"
  | "user"
  | "operator"
  | "client"
  | "contract"
  | "equipmentType"
  | "equipment"
  | "assignment"
  | "term"
  | "post"
  | "customField"
  | "maintenanceOrder"
  | "alert";

export type AuditLogAction =
  | "created"
  | "updated"
  | "deleted"
  | "restored"
  | "login"
  | "logout"
  | "statusChanged";

export interface AuditLog {
  id: string;
  organizationId: string;

  entity: AuditLogEntity;
  action: AuditLogAction;

  entityId: string | null;

  actorUserId: string | null;

  message: string | null;
  metadata: Record<string, unknown> | null;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateAuditLogInput {
  entity: AuditLogEntity;
  action: AuditLogAction;
  entityId?: string;

  actorUserId?: string;

  message?: string;
  metadata?: Record<string, unknown>;
}

export type UpdateAuditLogInput = Partial<CreateAuditLogInput>;
