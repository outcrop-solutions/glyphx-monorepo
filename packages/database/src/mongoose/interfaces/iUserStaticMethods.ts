// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IUserMethods} from './iUserMethods';
import {IUserCreateInput} from './iUserCreateInput';

export interface IUserStaticMethods extends Model<databaseTypes.IUser, {}, IUserMethods> {
  userIdExists(userId: mongooseTypes.ObjectId): Promise<boolean>;
  allUserIdsExist(userIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createUser(input: IUserCreateInput): Promise<databaseTypes.IUser>;
  getUserById(userId: string): Promise<databaseTypes.IUser>;
  queryUsers(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IUser>>;
  updateUserWithFilter(
    filter: Record<string, unknown>,
    user: Omit<Partial<databaseTypes.IUser>, '_id'>
  ): Promise<databaseTypes.IUser>;
  updateUserById(userId: string, user: Omit<Partial<databaseTypes.IUser>, '_id'>): Promise<databaseTypes.IUser>;
  deleteUserById(userId: string): Promise<void>;
  validateUpdateObject(user: Omit<Partial<databaseTypes.IUser>, '_id'>): Promise<void>;
  addAccounts(userId: string, accounts: (databaseTypes.IAccount | string)[]): Promise<databaseTypes.IUser>;
  removeAccounts(userId: string, accounts: (databaseTypes.IAccount | string)[]): Promise<databaseTypes.IUser>;
  validateAccounts(accounts: (databaseTypes.IAccount | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addSessions(userId: string, sessions: (databaseTypes.ISession | string)[]): Promise<databaseTypes.IUser>;
  removeSessions(userId: string, sessions: (databaseTypes.ISession | string)[]): Promise<databaseTypes.IUser>;
  validateSessions(sessions: (databaseTypes.ISession | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addMemberships(userId: string, memberships: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IUser>;
  removeMemberships(userId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IUser>;
  validateMemberships(members: (databaseTypes.IMember | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addInvitedMembers(userId: string, invitedMembers: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IUser>;
  removeInvitedMembers(userId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IUser>;
  validateInvitedMembers(members: (databaseTypes.IMember | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addCreatedWorkspaces(
    userId: string,
    createdWorkspaces: (databaseTypes.IWorkspace | string)[]
  ): Promise<databaseTypes.IUser>;
  removeCreatedWorkspaces(
    userId: string,
    workspaces: (databaseTypes.IWorkspace | string)[]
  ): Promise<databaseTypes.IUser>;
  validateCreatedWorkspaces(workspaces: (databaseTypes.IWorkspace | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addProjects(userId: string, projects: (databaseTypes.IProject | string)[]): Promise<databaseTypes.IUser>;
  removeProjects(userId: string, projects: (databaseTypes.IProject | string)[]): Promise<databaseTypes.IUser>;
  validateProjects(projects: (databaseTypes.IProject | string)[]): Promise<mongooseTypes.ObjectId[]>;
  addCustomerPayment(
    userId: string,
    customerPayment: databaseTypes.ICustomerPayment | string
  ): Promise<databaseTypes.IUser>;
  removeCustomerPayment(
    userId: string,
    customerPayment: databaseTypes.ICustomerPayment | string
  ): Promise<databaseTypes.IUser>;
  validateCustomerPayment(customerPayment: databaseTypes.ICustomerPayment | string): Promise<mongooseTypes.ObjectId>;
  addWebhooks(userId: string, webhooks: (databaseTypes.IWebhook | string)[]): Promise<databaseTypes.IUser>;
  removeWebhooks(userId: string, webhooks: (databaseTypes.IWebhook | string)[]): Promise<databaseTypes.IUser>;
  validateWebhooks(webhooks: (databaseTypes.IWebhook | string)[]): Promise<mongooseTypes.ObjectId[]>;
}
