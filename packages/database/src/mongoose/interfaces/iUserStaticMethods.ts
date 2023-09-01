import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
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
  validateMembership(
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateWorkspaces(
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateProjects(
    projects: (databaseTypes.IProject | mongooseTypes.ObjectId)[]
  ): Promise<mongooseTypes.ObjectId[]>;
  validateCustomerPayment(
    payment?: databaseTypes.ICustomerPayment | mongooseTypes.ObjectId
  ): Promise<mongooseTypes.ObjectId>;
  validateUpdateObject(
    input: Omit<Partial<databaseTypes.IUser>, '_id'>
  ): Promise<boolean>;
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
  addMembership(
    userId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeMembership(
    userId: mongooseTypes.ObjectId,
    members: (databaseTypes.IMember | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  addWorkspaces(
    userId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
  removeWorkspaces(
    userId: mongooseTypes.ObjectId,
    workspaces: (databaseTypes.IWorkspace | mongooseTypes.ObjectId)[]
  ): Promise<databaseTypes.IUser>;
}
