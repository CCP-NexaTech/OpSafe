export type AssignmentStatus = "active" | "returned" | "canceled";

export interface Assignment {
  id: string;
  organizationId: string;

  operatorId: string;
  equipmentId: string;

  assignedAt: string;
  expectedReturnAt: string | null;
  returnedAt: string | null;

  status: AssignmentStatus;

  notes: string | null;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateAssignmentInput {
  operatorId: string;
  equipmentId: string;

  assignedAt?: string;
  expectedReturnAt?: string;

  notes?: string;
}

export type UpdateAssignmentInput = Partial<CreateAssignmentInput> & {
  returnedAt?: string;
  status?: AssignmentStatus;
};
