import { apiRoutes } from "../../routes";
import type { CreateOperatorInput, Operator, UpdateOperatorInput } from "./operators.types";

export const organizationOperatorsContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) => apiRoutes.organizations.operators.list(organizationId),
    response: {} as Operator[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) => apiRoutes.organizations.operators.create(organizationId),
    body: {} as CreateOperatorInput,
    response: {} as Operator,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, operatorId: string) =>
      apiRoutes.organizations.operators.getById(organizationId, operatorId),
    response: {} as Operator,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, operatorId: string) =>
      apiRoutes.organizations.operators.update(organizationId, operatorId),
    body: {} as UpdateOperatorInput,
    response: {} as Operator,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, operatorId: string) =>
      apiRoutes.organizations.operators.softDelete(organizationId, operatorId),
    response: {} as unknown,
  },
} as const;
