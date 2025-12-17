import { apiRoutes } from "../../routes";
import type {
  AcceptInviteInput,
  InviteOrganizationUserInput,
  OrganizationUser,
  UpdateOrganizationUserInput,
} from "./users.types";

export const organizationUsersContract = {
  invite: {
    method: "POST" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.users.invite(organizationId),
    body: {} as InviteOrganizationUserInput,
    response: {} as { inviteId: string; email: string },
  },

  acceptInvite: {
    method: "POST" as const,
    path: () => apiRoutes.users.acceptInvite(),
    body: {} as AcceptInviteInput,
    response: {} as OrganizationUser,
  },

  list: {
    method: "GET" as const,
    path: (organizationId: string) =>
      apiRoutes.organizations.users.list(organizationId),
    response: {} as OrganizationUser[],
  },

  getById: {
    method: "GET" as const,
    path: (organizationId: string, userId: string) =>
      apiRoutes.organizations.users.getById(organizationId, userId),
    response: {} as OrganizationUser,
  },

  update: {
    method: "PATCH" as const,
    path: (organizationId: string, userId: string) =>
      apiRoutes.organizations.users.update(organizationId, userId),
    body: {} as UpdateOrganizationUserInput,
    response: {} as OrganizationUser,
  },

  softDelete: {
    method: "DELETE" as const,
    path: (organizationId: string, userId: string) =>
      apiRoutes.organizations.users.softDelete(organizationId, userId),
    response: {} as unknown,
  },
} as const;
