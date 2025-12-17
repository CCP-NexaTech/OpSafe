export type ClientStatus = "active" | "inactive";

export interface Client {
  id: string;
  organizationId: string;

  name: string;
  document: string | null;

  email: string | null;
  phone: string | null;

  status: ClientStatus;

  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateClientInput {
  name: string;
  document?: string;
  email?: string;
  phone?: string;
}

export type UpdateClientInput = Partial<CreateClientInput> & {
  status?: ClientStatus;
};
