export type ContractStatus = "active" | "inactive";

export interface Contract {
  id: string;
  organizationId: string;

  clientId: string;
  title: string;
  description: string | null;

  startDate: string | null;
  endDate: string | null;

  status: ContractStatus;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateContractInput {
  clientId: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export type UpdateContractInput = Partial<CreateContractInput> & {
  status?: ContractStatus;
};
