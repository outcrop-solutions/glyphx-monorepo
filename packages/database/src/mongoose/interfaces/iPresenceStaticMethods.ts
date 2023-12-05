// THIS CODE WAS AUTOMATICALLY GENERATED
import {Types as mongooseTypes, Model} from 'mongoose';
import {IQueryResult, databaseTypes} from 'types';
import {IPresenceMethods} from './iPresenceMethods';
import {IPresenceCreateInput} from './iPresenceCreateInput';

export interface IPresenceStaticMethods extends Model<databaseTypes.IPresence, {}, IPresenceMethods> {
  presenceIdExists(presenceId: mongooseTypes.ObjectId): Promise<boolean>;
  allPresenceIdsExist(presenceIds: mongooseTypes.ObjectId[]): Promise<boolean>;
  createPresence(input: IPresenceCreateInput): Promise<databaseTypes.IPresence>;
  getPresenceById(presenceId: string): Promise<databaseTypes.IPresence>;
  queryPresences(
    filter?: Record<string, unknown>,
    page?: number,
    itemsPerPage?: number
  ): Promise<IQueryResult<databaseTypes.IPresence>>;
  updatePresenceWithFilter(
    filter: Record<string, unknown>,
    presence: Omit<Partial<databaseTypes.IPresence>, '_id'>
  ): Promise<databaseTypes.IPresence>;
  updatePresenceById(
    presenceId: string,
    presence: Omit<Partial<databaseTypes.IPresence>, '_id'>
  ): Promise<databaseTypes.IPresence>;
  deletePresenceById(presenceId: string): Promise<void>;
  validateUpdateObject(presence: Omit<Partial<databaseTypes.IPresence>, '_id'>): Promise<void>;
  addConfig(presenceId: string, modelConfig: databaseTypes.IModelConfig | string): Promise<databaseTypes.IPresence>;
  removeConfig(presenceId: string, modelConfig: databaseTypes.IModelConfig | string): Promise<databaseTypes.IPresence>;
  validateConfig(modelConfig: databaseTypes.IModelConfig | string): Promise<mongooseTypes.ObjectId>;
}
