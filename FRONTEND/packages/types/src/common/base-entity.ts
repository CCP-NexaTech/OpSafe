import type { EntityId, IsoDateString } from "./primitives";

export interface BaseEntity {
  id: EntityId;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
  isDeleted: boolean;
}
