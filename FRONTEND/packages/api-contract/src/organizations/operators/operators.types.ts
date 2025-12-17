export type OperatorStatus = "active" | "inactive";

export interface Operator {
  id: string;
  organizationId: string;

  fullName: string;
  document: string | null;
  email: string | null;
  phone: string | null;

  status: OperatorStatus;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateOperatorInput {
  fullName: string;
  document?: string;
  email?: string;
  phone?: string;
}

export type UpdateOperatorInput = Partial<CreateOperatorInput> & {
  status?: OperatorStatus;
};
