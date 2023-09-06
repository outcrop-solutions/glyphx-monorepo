import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface ICustomerPaymentCreateInput
  extends Omit<databaseTypes.ICustomerPayment, '_id' | 'createdAt' | 'updatedAt' | 'customer'> {
  customer: mongooseTypes.ObjectId | databaseTypes.IUser;
}
