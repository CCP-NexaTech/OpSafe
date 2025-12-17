import { apiRoutes } from "../../routes";
import type { Alert, CreateAlertInput, UpdateAlertInput } from "./alerts.types";

export const organizationAlertsContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) => apiRoutes.organizations.alerts.list(organizationId),
    response: {} as Alert[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) => apiRoutes.organizations.alerts.create(organizationId),
    body: {} as CreateAlertInput,
    response: {} as Alert,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, alertId: string) =>
      apiRoutes.organizations.alerts.getById(organizationId, alertId),
    response: {} as Alert,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, alertId: string) =>
      apiRoutes.organizations.alerts.update(organizationId, alertId),
    body: {} as UpdateAlertInput,
    response: {} as Alert,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, alertId: string) =>
      apiRoutes.organizations.alerts.softDelete(organizationId, alertId),
    response: {} as unknown,
  },
} as const;
