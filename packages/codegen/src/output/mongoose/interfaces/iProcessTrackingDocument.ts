import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProcessTrackingDocument
  extends Omit<databaseTypes.IProcessTracking,  | 'processMessages'> {
                processMessages: mongooseTypes.ObjectId[];
}
