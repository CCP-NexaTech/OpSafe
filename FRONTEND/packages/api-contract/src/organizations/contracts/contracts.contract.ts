import { apiRoutes } from "../../routes";
import type { Contract, CreateContractInput, UpdateContractInput } from "./contracts.types";

export const organizationContractsContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) => apiRoutes.organizations.contracts.list(organizationId),
    response: {} as Contract[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) => apiRoutes.organizations.contracts.create(organizationId),
    body: {} as CreateContractInput,
    response: {} as Contract,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, contractId: string) =>
      apiRoutes.organizations.contracts.getById(organizationId, contractId),
    response: {} as Contract,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, contractId: string) =>
      apiRoutes.organizations.contracts.update(organizationId, contractId),
    body: {} as UpdateContractInput,
    response: {} as Contract,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, contractId: string) =>
      apiRoutes.organizations.contracts.softDelete(organizationId, contractId),
    response: {} as unknown,
  },
} as const;
