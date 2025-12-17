export type OrganizationStatus = "active" | "inactive";

export interface Organization {
  id: string;
  name: string;
  document: string | null;
  status: OrganizationStatus;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface CreateOrganizationInput {
  name: string;
  document?: string;
}

export type UpdateOrganizationInput = Partial<CreateOrganizationInput> & {
  status?: OrganizationStatus;
};
