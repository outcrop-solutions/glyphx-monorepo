import { database as databaseTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';

export interface IUserCreateInput extends Omit<databaseTypes.IUser, 'customerpayment'> {
  customerpayment: mongooseTypes.ObjectId | databaseTypes.ICustomerPayment;
}
