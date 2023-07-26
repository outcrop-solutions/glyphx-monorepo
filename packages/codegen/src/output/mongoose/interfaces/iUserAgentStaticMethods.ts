import { Types as mongooseTypes, Model } from 'mongoose';
import { IQueryResult, database as databaseTypes } from '@glyphx/types';
import { IUserAgentMethods } from './iUserAgentMethods';
import { IUserAgentCreateInput } from './iUserAgentCreateInput';

export interface IUserAgentStaticMethods extends Model<databaseTypes.IUserAgent, {}, IUserAgentMethods> {
  useragentIdExists(useragentId: mongooseTypes.ObjectId): Promise<boolean>;
  allUserAgentIdsExist(useragentIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createUserAgent(input: IUserAgentCreateInput): Promise<databaseTypes.IUserAgent>;
  getUserAgentById(useragentId: mongooseTypes.ObjectId): Promise<databaseTypes.IUserAgent>;
  queryUserAgents(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IUserAgent>>;
  updateUserAgentWithFilter(
    filter: Record<string, unknown>,
    useragent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>
  ): Promise<databaseTypes.IUserAgent>;
  updateUserAgentById(
    useragentId: mongooseTypes.ObjectId,
    useragent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>
  ): Promise<databaseTypes.IUserAgent>;
  deleteUserAgentById(useragentId: mongooseTypes.ObjectId): Promise<void>;
  validateUpdateObject(useragent: Omit<Partial<databaseTypes.IUserAgent>, '_id'>): Promise<void>;
}
