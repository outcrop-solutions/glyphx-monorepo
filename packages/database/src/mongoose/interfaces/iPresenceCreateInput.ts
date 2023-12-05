// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IPresenceCreateInput
  extends Omit<databaseTypes.IPresence, '_id' | 'createdAt' | 'updatedAt' | 'config'> {
  config: string | databaseTypes.IModelConfig;
}
