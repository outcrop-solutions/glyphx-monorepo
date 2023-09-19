// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IUserCreateInput
  extends Omit<databaseTypes.IUser, '_id' | 'createdAt' | 'updatedAt'  | 'customerPayment'> {
            customerPayment: mongooseTypes.ObjectId | databaseTypes.ICustomerPayment;
}
