import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ICustomerPaymentDocument
  extends Omit<databaseTypes.ICustomerPayment, 'customer'> {
  customer: mongooseTypes.ObjectId;
}
