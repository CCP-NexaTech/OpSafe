import type { BaseEntity, EntityId } from "../common";

export type ServicePostStatus = "active" | "inactive";

export interface ServicePost extends BaseEntity {
  organizationId: EntityId;

  clientId: EntityId | null;
  contractId: EntityId | null;

  name: string;
  description: string | null;

  address: string | null;

  status: ServicePostStatus;
}

export type ServicePostId = EntityId;
