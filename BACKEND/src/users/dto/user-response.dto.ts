import type { UserRole, UserStatus } from '../../types/database/users';

export interface UserResponseDto {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}
