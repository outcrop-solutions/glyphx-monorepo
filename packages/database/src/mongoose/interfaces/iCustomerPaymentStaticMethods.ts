import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {ICustomerPaymentMethods} from './iCustomerPaymentMethods';
export interface ICustomerPaymentStaticMethods
  extends Model<databaseTypes.ICustomerPayment, {}, ICustomerPaymentMethods> {
  customerPaymentIdExists(
    customerPaymentId: mongooseTypes.ObjectId
  ): Promise<boolean>;
  allCustomerPaymentIdsExist(
    customerPaymentIds: mongooseTypes.ObjectId[]
  ): Promise<boolean>;
  createCustomerPayment(
    input: Omit<databaseTypes.ICustomerPayment, '_id'>
  ): Promise<databaseTypes.ICustomerPayment>;
  getCustomerPaymentById(
    customerPaymentId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.ICustomerPayment>; //new
  getCustomerPaymentByEmail(
    customerEmail: string
  ): Promise<databaseTypes.ICustomerPayment>; //new
  getCustomerPaymentByStripeId(
    stripeId: string
  ): Promise<databaseTypes.ICustomerPayment>; //new
  getCustomerPaymentByFilter(
    filter: Record<string, unknown>
  ): Promise<databaseTypes.ICustomerPayment>;
  queryCustomerPayments(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.ICustomerPayment>>;
  updateCustomerPaymentWithFilter(
    filter: Record<string, unknown>,
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<void>; // new
  updateCustomerPaymentById(
    customerPaymentId: mongooseTypes.ObjectId,
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<databaseTypes.ICustomerPayment>; //new
  updateCustomerPaymentByStripeId(
    stripeId: string,
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<databaseTypes.ICustomerPayment>; // new
  deleteCustomerPaymentById(sessionId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<void>;
}
