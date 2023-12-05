// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IUserAgentMethods} from './iUserAgentMethods';
import {IUserAgentCreateInput} from './iUserAgentCreateInput';

export interface IUserAgentStaticMethods extends Model<databaseTypes.IUserAgent, {}, IUserAgentMethods> {
  userAgentIdExists(userAgentId: mongooseTypes.ObjectId): Promise<boolean>;
  allUserAgentIdsExist(userAgentIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createUserAgent(input: IUserAgentCreateInput): Promise<databaseTypes.IUserAgent>;
  getUserAgentById(userAgentId: string): Promise<databaseTypes.IUserAgent>;
  queryUserAgents(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IUserAgent>>;
  updateUserAgentWithFilter(
    filter: Record<string, unknown>,
    userAgent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>
  ): Promise<databaseTypes.IUserAgent>;
  updateUserAgentById(
    userAgentId: string,
    userAgent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>
  ): Promise<databaseTypes.IUserAgent>;
  deleteUserAgentById(userAgentId: string): Promise<void>;
  validateUpdateObject(userAgent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>): Promise<void>;
}
