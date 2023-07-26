import { database as databaseTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';

export interface ICustomerPaymentCreateInput
  extends Omit<databaseTypes.ICustomerPayment, '_id' | 'createdAt' | 'updatedAt' | 'user'> {
  user: mongooseTypes.ObjectId | databaseTypes.IUser;
}
