import { ObjectId } from 'mongodb';
import { BaseDocument } from './common';

export type AuditLogAction =
  | 'user.login'
  | 'user.logout'
  | 'user.invite'
  | 'user.acceptInvite'
  | 'user.update'
  | 'operator.create'
  | 'operator.update'
  | 'operator.delete'
  | 'client.create'
  | 'client.update'
  | 'client.delete'
  | 'contract.create'
  | 'contract.update'
  | 'contract.delete'
  | 'post.create'
  | 'post.update'
  | 'post.delete'
  | 'equipmentType.create'
  | 'equipmentType.update'
  | 'equipmentType.delete'
  | 'equipment.create'
  | 'equipment.update'
  | 'equipment.delete'
  | 'assignment.create'
  | 'assignment.complete'
  | 'maintenanceOrder.create'
  | 'maintenanceOrder.update'
  | 'alert.create'
  | 'alert.update'
  | 'term.create'
  | 'term.update'
  | 'term.delete';

export type AuditLogEntityType =
  | 'organization'
  | 'user'
  | 'operator'
  | 'client'
  | 'contract'
  | 'post'
  | 'equipmentType'
  | 'equipment'
  | 'assignment'
  | 'term'
  | 'maintenanceOrder'
  | 'alert';

export interface AuditLog extends BaseDocument {
  organizationId: ObjectId;
  userId: ObjectId;
  action: AuditLogAction;
  entityType: AuditLogEntityType;
  entityId?: ObjectId | null;
  ip?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, string | number | boolean | null> | null;
}
