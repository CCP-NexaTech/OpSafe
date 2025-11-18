import type { UserRole, UserStatus } from '../../types/database/users';

export interface LoginResponseDto {
  accessToken: string;
  tokenType: 'bearer';
  expiresIn: number;
  user: {
    id: string;
    organizationId: string;
    email: string;
    name: string;
    role: UserRole;
    status: UserStatus;
  };
}
