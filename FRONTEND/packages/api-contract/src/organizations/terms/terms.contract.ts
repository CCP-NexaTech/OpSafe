import { apiRoutes } from "../../routes";
import type { CreateTermInput, Term, UpdateTermInput } from "./terms.types";

export const organizationTermsContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) => apiRoutes.organizations.terms.list(organizationId),
    response: {} as Term[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) => apiRoutes.organizations.terms.create(organizationId),
    body: {} as CreateTermInput,
    response: {} as Term,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, termId: string) =>
      apiRoutes.organizations.terms.getById(organizationId, termId),
    response: {} as Term,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, termId: string) =>
      apiRoutes.organizations.terms.update(organizationId, termId),
    body: {} as UpdateTermInput,
    response: {} as Term,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, termId: string) =>
      apiRoutes.organizations.terms.softDelete(organizationId, termId),
    response: {} as unknown,
  },
} as const;
