import type { BaseEntity, EntityId } from "../common";

export type ClientStatus = "active" | "inactive";

export interface Client extends BaseEntity {
  organizationId: EntityId;

  name: string;
  document: string | null;

  email: string | null;
  phone: string | null;

  status: ClientStatus;
}

export type ClientId = EntityId;
