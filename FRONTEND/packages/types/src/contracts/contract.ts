import type { BaseEntity, EntityId, IsoDateString } from "../common";

export type ContractStatus = "active" | "inactive";

export interface Contract extends BaseEntity {
  organizationId: EntityId;

  clientId: EntityId;

  title: string;
  description: string | null;

  startDate: IsoDateString | null;
  endDate: IsoDateString | null;

  status: ContractStatus;
}

export type ContractId = EntityId;
