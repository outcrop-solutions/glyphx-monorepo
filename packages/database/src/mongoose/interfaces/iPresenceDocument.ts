// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IPresenceDocument extends Omit<databaseTypes.IPresence, 'config'> {
  config: mongooseTypes.ObjectId;
}
