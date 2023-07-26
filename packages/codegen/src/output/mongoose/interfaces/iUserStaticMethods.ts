import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { IUserMethods } from './iUserMethods';
import { IUserCreateInput } from './iUserCreateInput';

export interface IUserStaticMethods extends Model<databaseTypes.IUser, {}, IUserMethods> {
  userIdExists(userId: mongooseTypes.ObjectId): Promise<boolean>;
  allUserIdsExist(userIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createUser(input: IUserCreateInput): Promise<databaseTypes.IUser>;
  getUserById(userId: mongooseTypes.ObjectId): Promise<databaseTypes.IUser>;
  queryUsers(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IUser>>;
  updateUserWithFilter(
    filter: Record<string, unknown>,
    user: Omit<Partial<databaseTypes.IUser>, '_id'>
  ): Promise<databaseTypes.IUser>;
  updateUserById(
    userId: mongooseTypes.ObjectId,
    user: Omit<Partial<databaseTypes.IUser>, '_id'>
  ): Promise<databaseTypes.IUser>;
  deleteUserById(userId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(user: Omit<Partial<databaseTypes.IUser>, '_id'>): Promise<void>;
  addCustomerPayments(
    userId: mongooseTypes.ObjectId,
    customerpayments: (databaseTypes.ICustomerPayment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeCustomerPayments(
    userId: mongooseTypes.ObjectId,
    customerpayments: (databaseTypes.ICustomerPayment | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  validateCustomerPayments(
    customerpayments: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
}
