import type { CustomFieldDataType } from '../../types/database/customFields';

export interface CustomFieldResponseDto {
  id: string;
  organizationId: string;
  targetCollection: string;
  fieldKey: string;
  label: string;
  dataType: CustomFieldDataType;
  required: boolean;
  options: string[] | null;
  helpText: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
