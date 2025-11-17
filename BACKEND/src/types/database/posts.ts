import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export type PostStatus = 'active' | 'inactive';

export interface Post extends BaseDocument {
  organizationId: ObjectId;
  clientId: ObjectId;
  content: string;
  status: PostStatus;
}
