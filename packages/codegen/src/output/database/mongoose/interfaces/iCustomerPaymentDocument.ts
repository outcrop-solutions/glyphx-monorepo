// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface ICustomerPaymentDocument
  extends Omit<databaseTypes.ICustomerPayment, 'customer'> {
  customer: mongooseTypes.ObjectId;
}
