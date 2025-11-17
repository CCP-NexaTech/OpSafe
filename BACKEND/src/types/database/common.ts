import { ObjectId } from 'mongodb';

export type BaseDocument = {
  _id: ObjectId;
  organizationId?: ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
