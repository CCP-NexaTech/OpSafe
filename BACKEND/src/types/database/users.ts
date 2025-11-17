import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export type UserStatus = 'active' | 'inactive';

export interface User extends BaseDocument {
  organizationId: ObjectId;
  email: string;
  name: string;
  passwordHash: string;
  role: 'admin' | 'operator';
  status: UserStatus;
}
