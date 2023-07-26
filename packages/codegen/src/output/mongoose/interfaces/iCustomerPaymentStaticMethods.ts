import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { ICustomerPaymentMethods } from './iCustomerPaymentMethods';
import { ICustomerPaymentCreateInput } from './iCustomerPaymentCreateInput';

export interface ICustomerPaymentStaticMethods
  extends Model<databaseTypes.ICustomerPayment, {}, ICustomerPaymentMethods> {
  customerpaymentIdExists(customerpaymentId: mongooseTypes.ObjectId): Promise<boolean>;
  allCustomerPaymentIdsExist(customerpaymentIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createCustomerPayment(input: ICustomerPaymentCreateInput): Promise<databaseTypes.ICustomerPayment>;
  getCustomerPaymentById(customerpaymentId: mongooseTypes.ObjectId): Promise<databaseTypes.ICustomerPayment>;
  queryCustomerPayments(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.ICustomerPayment>>;
  updateCustomerPaymentWithFilter(
    filter: Record<string, unknown>,
    customerpayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<databaseTypes.ICustomerPayment>;
  updateCustomerPaymentById(
    customerpaymentId: mongooseTypes.ObjectId,
    customerpayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<databaseTypes.ICustomerPayment>;
  deleteCustomerPaymentById(customerpaymentId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(customerpayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>): Promise<void>;
  addUsers(
    customerpaymentId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ICustomerPayment>;
  removeUsers(
    customerpaymentId: mongooseTypes.ObjectId,
    users: (databaseTypes.IUser | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.ICustomerPayment>;
  validateUsers(users: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]): Promise<mongooseTypes.ObjectId[]>;
}
