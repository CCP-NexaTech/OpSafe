export type UserStatus = "active" | "inactive";

export interface OrganizationUser {
  id: string;
  organizationId: string;
  email: string;
  fullName: string | null;
  roles: string[];
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface InviteOrganizationUserInput {
  email: string;
  roles?: string[];
}

export interface AcceptInviteInput {
  inviteToken: string;
  password: string;
  fullName?: string;
}

export type UpdateOrganizationUserInput = Partial<{
  email: string;
  fullName: string;
  roles: string[];
  status: UserStatus;
}>;
