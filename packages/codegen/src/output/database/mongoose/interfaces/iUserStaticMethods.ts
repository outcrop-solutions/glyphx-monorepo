// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {databaseTypes} from '../../../../../database';
import {IQueryResult} from '@glyphx/types';
import {IUserMethods} from './iUserMethods';
import {IUserCreateInput} from './iUserCreateInput';

export interface IUserStaticMethods
  extends Model<databaseTypes.IUser, {}, IUserMethods> {
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
  validateUpdateObject(
    user: Omit<Partial<databaseTypes.IUser>, '_id'>
  ): Promise<void>;
  addAccounts(
    userId: mongooseTypes.ObjectId,
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeAccounts(
    userId: mongooseTypes.ObjectId,
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  validateAccounts(
    accounts: (databaseTypes.IAccount | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  addSessions(
    userId: mongooseTypes.ObjectId,
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeSessions(
    userId: mongooseTypes.ObjectId,
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  validateSessions(
    sessions: (databaseTypes.ISession | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  addMemberships(
    userId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeMemberships(
    userId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  validateMemberships(
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  addInvitedMembers(
    userId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeInvitedMembers(
    userId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  validateInvitedMembers(
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  addCreatedWorkspaces(
    userId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeCreatedWorkspaces(
    userId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  validateCreatedWorkspaces(
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  addProjects(
    userId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeProjects(
    userId: mongooseTypes.ObjectId,
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  validateProjects(
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  addCustomerPayment(
    userId: mongooseTypes.ObjectId,
    customerPayment: databaseTypes.ICustomerPayment | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IUser>;
  removeCustomerPayment(
    userId: mongooseTypes.ObjectId,
    customerPayment: databaseTypes.ICustomerPayment | mongooseTypes.ObjectId
  ): Promise<databaseTypes.IUser>;
  validateCustomerPayment(
    customerPayment: databaseTypes.ICustomerPayment | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  addWebhooks(
    userId: mongooseTypes.ObjectId,
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeWebhooks(
    userId: mongooseTypes.ObjectId,
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  validateWebhooks(
    webhooks: (databaseTypes.IWebhook | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
}
