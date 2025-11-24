import { ObjectId } from 'mongodb';
import { BaseDocument } from './common';

export type TermStatus = 'active' | 'inactive';

export interface Term extends BaseDocument {
  organizationId: ObjectId;
  code: string;
  title: string;
  description?: string | null;
  content: string;
  version: string;
  status: TermStatus;
}
