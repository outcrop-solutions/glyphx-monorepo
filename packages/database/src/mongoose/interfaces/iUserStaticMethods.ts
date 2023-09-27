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
  updateUserById(id: string, user: Partial<databaseTypes.IUser>): Promise<databaseTypes.IUser>;
  deleteUserById(id: string): Promise<void>;
  updateUserWithFilter(
    filter: Record<string, unknown>,
    user: Partial<databaseTypes.IUser>
  ): Promise<databaseTypes.IUser>;
  validateAccounts(accounts: (databaseTypes.IAccount | string)[]): Promise<string[]>;
  validateSessions(sessions: (databaseTypes.ISession | string)[]): Promise<string[]>;
  validateWebhooks(webhooks: (databaseTypes.IWebhook | string)[]): Promise<string[]>;
  validateMembership(members: (databaseTypes.IMember | string)[]): Promise<string[]>;
  validateWorkspaces(workspaces: (databaseTypes.IWorkspace | string)[]): Promise<string[]>;
  validateProjects(projects: (databaseTypes.IProject | string)[]): Promise<string[]>;
  validateCustomerPayment(payment?: databaseTypes.ICustomerPayment | string): Promise<string>;
  validateUpdateObject(input: Omit<Partial<databaseTypes.IUser>, '_id'>): Promise<boolean>;
  addProjects(userId: string, projects: (databaseTypes.IProject | string)[]): Promise<databaseTypes.IUser>;
  removeProjects(userId: string, accounts: (databaseTypes.IProject | string)[]): Promise<databaseTypes.IUser>;
  addAccounts(userId: string, accounts: (databaseTypes.IAccount | string)[]): Promise<databaseTypes.IUser>;
  removeAccounts(userId: string, accounts: (databaseTypes.IAccount | string)[]): Promise<databaseTypes.IUser>;
  addSessions(userId: string, sessions: (databaseTypes.ISession | string)[]): Promise<databaseTypes.IUser>;
  removeSessions(userId: string, sessions: (databaseTypes.ISession | string)[]): Promise<databaseTypes.IUser>;
  addWebhooks(userId: string, webhooks: (databaseTypes.IWebhook | string)[]): Promise<databaseTypes.IUser>;
  removeWebhooks(userId: string, webhooks: (databaseTypes.IWebhook | string)[]): Promise<databaseTypes.IUser>;
  addMembership(userId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IUser>;
  removeMembership(userId: string, members: (databaseTypes.IMember | string)[]): Promise<databaseTypes.IUser>;
  addWorkspaces(userId: string, workspaces: (databaseTypes.IWorkspace | string)[]): Promise<databaseTypes.IUser>;
  removeWorkspaces(userId: string, workspaces: (databaseTypes.IWorkspace | string)[]): Promise<databaseTypes.IUser>;
}
