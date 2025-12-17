import type { BaseEntity, EntityId, IsoDateString } from "../common";

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
  | "customField"
  | "maintenanceOrder"
  | "alert"
  | "post";

export type AuditLogAction =
  | "created"
  | "updated"
  | "deleted"
  | "restored"
  | "login"
  | "logout"
  | "statusChanged";

export interface AuditLog extends BaseEntity {
  organizationId: EntityId;

  entity: AuditLogEntity;
  action: AuditLogAction;

  entityId: EntityId | null;
  actorUserId: EntityId | null;

  message: string | null;
  metadata: Record<string, unknown> | null;

  occurredAt: IsoDateString;
}

export type AuditLogId = EntityId;
