import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {ICustomerPaymentMethods} from './iCustomerPaymentMethods';
import {ICustomerPaymentCreateInput} from './iCustomerPaymentCreateInput';

export interface ICustomerPaymentStaticMethods
  extends Model<databaseTypes.ICustomerPayment, {}, ICustomerPaymentMethods> {
  customer_paymentIdExists(customer_paymentId: mongooseTypes.ObjectId): Promise<boolean>;
  allCustomerPaymentIdsExist(customer_paymentIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createCustomerPayment(input: ICustomerPaymentCreateInput): Promise<databaseTypes.ICustomerPayment>;
  getCustomerPaymentById(customer_paymentId: mongooseTypes.ObjectId): Promise<databaseTypes.ICustomerPayment>;
  queryCustomerPayments(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.ICustomerPayment>>;
  updateCustomerPaymentWithFilter(filter: Record<string, unknown>, customer_payment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>): Promise<databaseTypes.ICustomerPayment>;
  updateCustomerPaymentById(customer_paymentId: mongooseTypes.ObjectId, customer_payment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>): Promise<databaseTypes.ICustomerPayment>;
  deleteCustomerPaymentById(customer_paymentId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(customer_payment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>): Promise<void>;
      addCustomer(
        customerpaymentId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.ICustomerPayment>;
      removeCustomer(
        customerpaymentId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.ICustomerPayment>;
      validateCustomer(
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
    }
