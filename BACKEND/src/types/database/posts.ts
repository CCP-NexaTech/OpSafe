import { ObjectId } from 'mongodb';
import { BaseDocument } from './common';

export type PostStatus = 'active' | 'inactive';

export interface Post extends BaseDocument {
  organizationId: ObjectId;
  clientId: ObjectId;
  name: string;
  location?: string;
  contractId?: ObjectId | null;
  status: PostStatus;
}
