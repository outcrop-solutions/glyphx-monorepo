// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IAccountMethods} from './iAccountMethods';
import {IAccountCreateInput} from './iAccountCreateInput';

export interface IAccountStaticMethods extends Model<databaseTypes.IAccount, {}, IAccountMethods> {
  accountIdExists(accountId: mongooseTypes.ObjectId): Promise<boolean>;
  allAccountIdsExist(accountIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createAccount(input: IAccountCreateInput): Promise<databaseTypes.IAccount>;
  getAccountById(accountId: string): Promise<databaseTypes.IAccount>;
  queryAccounts(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IAccount>>;
  updateAccountWithFilter(
    filter: Record<string, unknown>,
    account: Omit<Partial<databaseTypes.IAccount>, '_id'>
  ): Promise<databaseTypes.IAccount>;
  updateAccountById(
    accountId: string,
    account: Omit<Partial<databaseTypes.IAccount>, '_id'>
  ): Promise<databaseTypes.IAccount>;
  deleteAccountById(accountId: string): Promise<void>;
  validateUpdateObject(account: Omit<Partial<databaseTypes.IAccount>, '_id'>): Promise<void>;
  addUser(accountId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IAccount>;
  removeUser(accountId: string, user: databaseTypes.IUser | string): Promise<databaseTypes.IAccount>;
  validateUser(user: databaseTypes.IUser | string): Promise<mongooseTypes.ObjectId>;
}
