// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IUserDocument
  extends Omit<databaseTypes.IUser,  | 'customerPayment'> {
            customerPayment: mongooseTypes.ObjectId;
}
