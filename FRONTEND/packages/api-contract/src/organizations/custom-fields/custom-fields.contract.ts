import { apiRoutes } from "../../routes";
import type {
  CreateCustomFieldInput,
  CustomField,
  UpdateCustomFieldInput,
} from "./custom-fields.types";

export const organizationCustomFieldsContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.customFields.list(organizationId),
    response: {} as CustomField[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.customFields.create(organizationId),
    body: {} as CreateCustomFieldInput,
    response: {} as CustomField,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, customFieldId: string) =>
      apiRoutes.organizations.customFields.getById(organizationId, customFieldId),
    response: {} as CustomField,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, customFieldId: string) =>
      apiRoutes.organizations.customFields.update(organizationId, customFieldId),
    body: {} as UpdateCustomFieldInput,
    response: {} as CustomField,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, customFieldId: string) =>
      apiRoutes.organizations.customFields.softDelete(organizationId, customFieldId),
    response: {} as unknown,
  },
} as const;
