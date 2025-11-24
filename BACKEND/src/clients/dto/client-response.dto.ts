export interface ClientResponseDto {
  id: string;
  organizationId: string;
  name: string;
  document: string;

  mainContactName?: string;
  mainContactPhone?: string;
  mainContactEmail?: string;

  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressCity?: string;
  addressState?: string;
  addressZipCode?: string;

  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
