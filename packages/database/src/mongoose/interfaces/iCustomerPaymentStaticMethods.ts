// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {ICustomerPaymentMethods} from './iCustomerPaymentMethods';
import {ICustomerPaymentCreateInput} from './iCustomerPaymentCreateInput';

export interface ICustomerPaymentStaticMethods
  extends Model<databaseTypes.ICustomerPayment, {}, ICustomerPaymentMethods> {
  customerPaymentIdExists(customerPaymentId: mongooseTypes.ObjectId): Promise<boolean>;
  allCustomerPaymentIdsExist(customerPaymentIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createCustomerPayment(input: ICustomerPaymentCreateInput): Promise<databaseTypes.ICustomerPayment>;
  getCustomerPaymentById(customerPaymentId: string): Promise<databaseTypes.ICustomerPayment>;
  queryCustomerPayments(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.ICustomerPayment>>;
  updateCustomerPaymentWithFilter(
    filter: Record<string, unknown>,
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<databaseTypes.ICustomerPayment>;
  updateCustomerPaymentById(
    customerPaymentId: string,
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<databaseTypes.ICustomerPayment>;
  deleteCustomerPaymentById(customerPaymentId: string): Promise<void>;
  validateUpdateObject(customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>): Promise<void>;
  addCustomer(customerPaymentId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.ICustomerPayment>;
  removeCustomer(
    customerPaymentId: string,
    user: databaseTypes.IUser | string
  ): Promise<databaseTypes.ICustomerPayment>;
  validateCustomer(user: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId>;
}
