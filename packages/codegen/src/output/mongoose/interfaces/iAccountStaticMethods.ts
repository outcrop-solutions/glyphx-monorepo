import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IAccountMethods} from './iAccountMethods';
import {IAccountCreateInput} from './iAccountCreateInput';

export interface IAccountStaticMethods
  extends Model<databaseTypes.IAccount, {}, IAccountMethods> {
  accountIdExists(accountId: mongooseTypes.ObjectId): Promise<boolean>;
  allAccountIdsExist(accountIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createAccount(input: IAccountCreateInput): Promise<databaseTypes.IAccount>;
  getAccountById(accountId: mongooseTypes.ObjectId): Promise<databaseTypes.IAccount>;
  queryAccounts(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IAccount>>;
  updateAccountWithFilter(filter: Record<string, unknown>, account: Omit<Partial<databaseTypes.IAccount>, '_id'>): Promise<databaseTypes.IAccount>;
  updateAccountById(accountId: mongooseTypes.ObjectId, account: Omit<Partial<databaseTypes.IAccount>, '_id'>): Promise<databaseTypes.IAccount>;
  deleteAccountById(accountId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(account: Omit<Partial<databaseTypes.IAccount>, '_id'>): Promise<void>;
      addUser(
        accountId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IAccount>;
      removeUser(
        accountId: mongooseTypes.ObjectId, 
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<databaseTypes.IAccount>;
      validateUser(
        user: databaseTypes.IUser | mongooseTypes.ObjectId
      ): Promise<mongooseTypes.ObjectId>;
    }
