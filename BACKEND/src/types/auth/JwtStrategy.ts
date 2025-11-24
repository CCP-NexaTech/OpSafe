import type { UserRole } from '../database/users';

export interface JwtPayload {
  sub: string;            
  organizationId: string; 
  role: UserRole;         

  iat?: number;
  exp?: number;
}
