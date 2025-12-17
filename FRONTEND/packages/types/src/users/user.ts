import type { BaseEntity, EntityId } from "../common";

export type UserStatus = "active" | "inactive";

export interface User extends BaseEntity {
  organizationId: EntityId;

  email: string;
  fullName: string | null;

  roles: string[];
  status: UserStatus;
}

export type UserId = EntityId;
