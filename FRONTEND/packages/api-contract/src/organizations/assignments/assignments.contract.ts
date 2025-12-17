import { apiRoutes } from "../../routes";
import type {
  Assignment,
  CreateAssignmentInput,
  UpdateAssignmentInput,
} from "./assignments.types";

export const organizationAssignmentsContract = {
  list: {
    method: "GET" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.assignments.list(organizationId),
    response: {} as Assignment[],
  },

  create: {
    method: "POST" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.assignments.create(organizationId),
    body: {} as CreateAssignmentInput,
    response: {} as Assignment,
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, assignmentId: string) =>
      apiRoutes.organizations.assignments.getById(organizationId, assignmentId),
    response: {} as Assignment,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, assignmentId: string) =>
      apiRoutes.organizations.assignments.update(organizationId, assignmentId),
    body: {} as UpdateAssignmentInput,
    response: {} as Assignment,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, assignmentId: string) =>
      apiRoutes.organizations.assignments.softDelete(organizationId, assignmentId),
    response: {} as unknown,
  },
} as const;
