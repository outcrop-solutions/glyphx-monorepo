import { database as databaseTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';

export interface ICustomerpaymentCreateInput
  extends Omit<databaseTypes.ICustomerpayment, '_id' | 'createdAt' | 'updatedAt' | 'customer'> {
  customer: mongooseTypes.ObjectId | databaseTypes.IUser;
}
