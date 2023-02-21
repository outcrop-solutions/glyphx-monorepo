import {Types as mongooseTypes, Model} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
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
  ): Promise<databaseTypes.ICustomerPayment>;
  getCustomerPaymentByEmail(
    customerEmail: string
  ): Promise<databaseTypes.ICustomerPayment>;
  updateCustomerPaymentWithFilter(
    filter: Record<string, unknown>,
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<void>;
  updateCustomerPaymentById(
    customerPaymentId: mongooseTypes.ObjectId,
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<databaseTypes.ICustomerPayment>;
  deleteCustomerPaymentById(sessionId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    customerPayment: Omit<Partial<databaseTypes.ICustomerPayment>, '_id'>
  ): Promise<void>;
}
