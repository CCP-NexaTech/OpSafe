import { ObjectId } from 'mongodb'
import { BaseDocument } from './common';

export interface CustomField extends BaseDocument {
  organizationId: ObjectId;
  targetCollection: string; // ex: equipments, clients, operators
  fieldKey: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'select';
  options?: string[];
}
