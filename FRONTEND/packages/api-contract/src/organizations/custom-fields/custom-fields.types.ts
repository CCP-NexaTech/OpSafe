export type CustomFieldStatus = "active" | "inactive";

export type CustomFieldDataType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "multiSelect";

export interface CustomField {
  id: string;
  organizationId: string;

  entity: "operator" | "equipment" | "client" | "contract";
  key: string;
  label: string;

  dataType: CustomFieldDataType;
  required: boolean;

  options: string[] | null;

  status: CustomFieldStatus;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateCustomFieldInput {
  entity: CustomField["entity"];
  key: string;
  label: string;
  dataType: CustomFieldDataType;
  required?: boolean;
  options?: string[];
}

export type UpdateCustomFieldInput = Partial<CreateCustomFieldInput> & {
  status?: CustomFieldStatus;
};
