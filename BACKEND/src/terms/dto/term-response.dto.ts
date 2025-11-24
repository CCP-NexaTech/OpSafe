import type { TermStatus } from '../../types/database/terms';

export interface TermResponseDto {
  id: string;
  organizationId: string;
  code: string;
  title: string;
  description: string | null;
  content: string;
  version: string;
  status: TermStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
