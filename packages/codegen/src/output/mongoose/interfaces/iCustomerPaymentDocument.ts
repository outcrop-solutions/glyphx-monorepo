import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface ICustomerPaymentDocument
  extends Omit<databaseTypes.ICustomerPayment,  | 'customer'> {
            customer: mongooseTypes.ObjectId;
}
