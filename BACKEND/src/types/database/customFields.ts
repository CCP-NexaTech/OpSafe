import { ObjectId } from 'mongodb';
import { BaseDocument } from './common';

export type CustomFieldDataType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'select';

export interface CustomField extends BaseDocument {
  organizationId: ObjectId;
  targetCollection: string;
  fieldKey: string;
  label: string;
  dataType: CustomFieldDataType;
  required: boolean;
  options?: string[];
  helpText?: string | null;
}
