import type { BaseEntity, EntityId } from "../common";

export type OrganizationStatus = "active" | "inactive";

export interface Organization extends BaseEntity {
  name: string;
  document: string | null;
}

export type OrganizationId = EntityId;
