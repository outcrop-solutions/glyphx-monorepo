import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, database as databaseTypes} from '@glyphx/types';
import {IUserAgentMethods} from './iUserAgentMethods';
import {IUserAgentCreateInput} from './iUserAgentCreateInput';

export interface IUserAgentStaticMethods
  extends Model<databaseTypes.IUserAgent, {}, IUserAgentMethods> {
  user_agentIdExists(user_agentId: mongooseTypes.ObjectId): Promise<boolean>;
  allUserAgentIdsExist(user_agentIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createUserAgent(input: IUserAgentCreateInput): Promise<databaseTypes.IUserAgent>;
  getUserAgentById(user_agentId: mongooseTypes.ObjectId): Promise<databaseTypes.IUserAgent>;
  queryUserAgents(filter?: Record<string, unknown>, page?: number, itemsPerPage?: number): Promise<IQueryResult<databaseTypes.IUserAgent>>;
  updateUserAgentWithFilter(filter: Record<string, unknown>, user_agent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>): Promise<databaseTypes.IUserAgent>;
  updateUserAgentById(user_agentId: mongooseTypes.ObjectId, user_agent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>): Promise<databaseTypes.IUserAgent>;
  deleteUserAgentById(user_agentId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(user_agent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>): Promise<void>;
}
