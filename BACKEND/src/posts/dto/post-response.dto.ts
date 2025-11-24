import type { PostStatus } from '../../types/database/posts';

export interface PostResponseDto {
  id: string;
  organizationId: string;
  clientId: string;
  name: string;
  location: string | null;
  contractId: string | null;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
