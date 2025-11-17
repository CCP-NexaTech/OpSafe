import { ObjectId } from 'mongodb';

export type UserRole = 'admin' | 'manager' | 'viewer';
export type UserStatus = 'pending' | 'active' | 'disabled';

export interface User {
  _id: ObjectId;
  organizationId: ObjectId;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  passwordHash: string | null;
  invitationToken: string | null;
  invitationExpiresAt: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
