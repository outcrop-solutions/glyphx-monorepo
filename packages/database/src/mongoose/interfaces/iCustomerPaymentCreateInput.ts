import {databaseTypes} from 'types';

export interface ICustomerPaymentCreateInput
  extends Omit<databaseTypes.ICustomerPayment, '_id' | 'createdAt' | 'updatedAt' | 'customer'> {
  customer: string | databaseTypes.IUser;
}
