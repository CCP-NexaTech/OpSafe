import { apiRoutes } from "../../routes";
import type { Client, CreateClientInput, UpdateClientInput } from "./clients.types";

export const organizationClientsContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) => apiRoutes.organizations.clients.list(organizationId),
    response: {} as Client[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) => apiRoutes.organizations.clients.create(organizationId),
    body: {} as CreateClientInput,
    response: {} as Client,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, clientId: string) =>
      apiRoutes.organizations.clients.getById(organizationId, clientId),
    response: {} as Client,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, clientId: string) =>
      apiRoutes.organizations.clients.update(organizationId, clientId),
    body: {} as UpdateClientInput,
    response: {} as Client,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, clientId: string) =>
      apiRoutes.organizations.clients.softDelete(organizationId, clientId),
    response: {} as unknown,
  },
} as const;
