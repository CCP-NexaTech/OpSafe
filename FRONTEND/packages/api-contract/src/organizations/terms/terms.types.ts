export type TermStatus = "active" | "inactive";

export interface Term {
  id: string;
  organizationId: string;

  title: string;
  content: string;

  version: string | null;

  status: TermStatus;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateTermInput {
  title: string;
  content: string;
  version?: string;
}

export type UpdateTermInput = Partial<CreateTermInput> & {
  status?: TermStatus;
};
