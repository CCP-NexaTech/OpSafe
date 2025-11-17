import { BaseDocument } from './common';

export type OrganizationStatus = 'active' | 'inactive';

export interface Organization extends BaseDocument {
  name: string;
  status: OrganizationStatus;
}
