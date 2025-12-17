import type { BaseEntity, EntityId } from "../common";

export type TermStatus = "active" | "inactive";

export interface Term extends BaseEntity {
  organizationId: EntityId;

  title: string;
  content: string;

  version: string | null;

  status: TermStatus;
}

export type TermId = EntityId;
