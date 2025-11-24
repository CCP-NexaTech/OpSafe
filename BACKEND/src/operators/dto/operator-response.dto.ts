import type { OperatorStatus } from '../../types/database/operators';

export interface OperatorResponseDto {
  id: string;
  organizationId: string;
  name: string;
  identifierCode: string;

  role?: string;
  phone?: string;
  email?: string;
  postId?: string;
  shift?: string;
  documentLastDigits?: string;

  status: OperatorStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
