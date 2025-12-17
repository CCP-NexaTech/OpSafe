import { apiRoutes } from "../../routes";
import type { AuditLog, CreateAuditLogInput, UpdateAuditLogInput } from "./audit-logs.types";

export const organizationAuditLogsContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) => apiRoutes.organizations.auditLogs.list(organizationId),
    response: {} as AuditLog[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) => apiRoutes.organizations.auditLogs.create(organizationId),
    body: {} as CreateAuditLogInput,
    response: {} as AuditLog,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, auditLogId: string) =>
      apiRoutes.organizations.auditLogs.getById(organizationId, auditLogId),
    response: {} as AuditLog,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, auditLogId: string) =>
      apiRoutes.organizations.auditLogs.update(organizationId, auditLogId),
    body: {} as UpdateAuditLogInput,
    response: {} as AuditLog,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, auditLogId: string) =>
      apiRoutes.organizations.auditLogs.softDelete(organizationId, auditLogId),
    response: {} as unknown,
  },
} as const;
