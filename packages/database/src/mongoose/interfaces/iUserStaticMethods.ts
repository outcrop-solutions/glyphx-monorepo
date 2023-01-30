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
  allUserIdsExist(userIds: mongooseTypes.ObjectId[]): Promise<boolean>;
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
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateSessions(
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateWebhooks(
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateOrganizations(
    organizations: (databaseTypes.IOrganization | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateProjects(
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateUpdateObject(
    input: Omit<Partial<databaseTypes.IUser>, '_id'>
  ): boolean;
  addProjects(
    userId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeProjects(
    userId: mongooseTypes.ObjectId,
    accounts: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  addAccounts(
    userId: mongooseTypes.ObjectId,
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeAccounts(
    userId: mongooseTypes.ObjectId,
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  addSessions(
    userId: mongooseTypes.ObjectId,
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeSessions(
    userId: mongooseTypes.ObjectId,
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  addWebhooks(
    userId: mongooseTypes.ObjectId,
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeWebhooks(
    userId: mongooseTypes.ObjectId,
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  addOrganizations(
    userId: mongooseTypes.ObjectId,
    organizations: (databaseTypes.IOrganization | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeOrganizations(
    userId: mongooseTypes.ObjectId,
    organizations: (databaseTypes.IOrganization | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
}
