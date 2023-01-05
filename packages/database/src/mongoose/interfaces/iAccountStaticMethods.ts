import mongoose, {
  Types as mongooseTypes,
  Model,
  Schema,
  HydratedDocument,
  model,
} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {IAccountMethods} from './iAccountMethods';
export interface IAccountStaticMethods
  extends Model<databaseTypes.IAccount, {}, IAccountMethods> {
  accountIdExists(accountId: mongooseTypes.ObjectId): Promise<boolean>;
  createAccount(
    input: Omit<databaseTypes.IAccount, '_id'>
  ): Promise<databaseTypes.IAccount>;
  getAccountById(
    accountId: mongooseTypes.ObjectId
  ): Promise<databaseTypes.IAccount>;
  updateAccountWithFilter(
    filter: Record<string, unknown>,
    account: Omit<Partial<databaseTypes.IAccount>, '_id'>
  ): Promise<databaseTypes.IAccount>;
  updateAccountById(
    accountId: mongooseTypes.ObjectId,
    account: Omit<Partial<databaseTypes.IAccount>, '_id'>
  ): Promise<databaseTypes.IAccount>;
  deleteAccountById(accountId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(
    account: Omit<Partial<databaseTypes.IAccount>, '_id'>
  ): Promise<void>;
}
