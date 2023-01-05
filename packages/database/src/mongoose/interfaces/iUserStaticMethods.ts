import mongoose, {
  Types as mongooseTypes,
  Model,
  Schema,
  HydratedDocument,
  model,
} from 'mongoose';
import {database as databaseTypes} from '@glyphx/types';
import {IUserMethods} from './iUserMethods';

export interface IUserStaticMethods
  extends Model<databaseTypes.IUser, {}, IUserMethods> {
  userIdExists(userId: mongooseTypes.ObjectId): Promise<boolean>;
  createUser(input: databaseTypes.IUser): Promise<databaseTypes.IUser>;
  getUserById(userId: mongooseTypes.ObjectId): Promise<databaseTypes.IUser>;
  updateUserById(
    id: mongooseTypes.ObjectId,
    user: Partial<databaseTypes.IUser>
  ): Promise<databaseTypes.IUser>;
  deleteUserById(id: mongooseTypes.ObjectId): Promise<void>;
  updateUserWithFilter(
    filter: Record<string, unknown>,
    user: Partial<databaseTypes.IUser>
  ): Promise<databaseTypes.IUser>;
  validateAccounts(
    accounts: databaseTypes.IAccount[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateSessions(
    sessions: databaseTypes.ISession[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateWebhooks(
    webhooks: databaseTypes.IWebhook[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateOrganizations(
    organization: (databaseTypes.IOrganization | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateProjects(
    projects: databaseTypes.IProject[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateUpdateObject(
    input: Omit<Partial<databaseTypes.IUser>, '_id'>
  ): boolean;
}
