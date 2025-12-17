import { apiRoutes } from "../routes";
import type {
  CreateOrganizationInput,
  Organization,
  UpdateOrganizationInput,
} from "./organizations.types";

export const organizationsContract = {
  list: {
    method: "GET" as const,
    path: () => apiRoutes.organizations.list(),
    response: {} as Organization[],
  },

  create: {
    method: "POST" as const,
    path: () => apiRoutes.organizations.create(),
    body: {} as CreateOrganizationInput,
    response: {} as Organization,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string) => apiRoutes.organizations.getById(organizationId),
    response: {} as Organization,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string) => apiRoutes.organizations.update(organizationId),
    body: {} as UpdateOrganizationInput,
    response: {} as Organization,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string) => apiRoutes.organizations.softDelete(organizationId),
    response: {} as unknown,
  },
} as const;
