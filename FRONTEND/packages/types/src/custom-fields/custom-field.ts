import type { BaseEntity, EntityId } from "../common";

export type CustomFieldStatus = "active" | "inactive";

export type CustomFieldDataType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "multiSelect";

export type CustomFieldEntity = "operator" | "equipment" | "client" | "contract";

export interface CustomField extends BaseEntity {
  organizationId: EntityId;

  entity: CustomFieldEntity;
  key: string;
  label: string;

  dataType: CustomFieldDataType;
  required: boolean;

  options: string[] | null;

  status: CustomFieldStatus;
}

export type CustomFieldId = EntityId;
