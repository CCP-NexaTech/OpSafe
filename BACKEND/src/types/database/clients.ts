import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export interface Client extends BaseDocument {
  organizationId: ObjectId;
  name: string;
}
