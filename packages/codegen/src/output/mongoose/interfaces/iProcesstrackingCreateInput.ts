import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProcessTrackingCreateInput
  extends Omit<databaseTypes.IProcessTracking, '_id' | 'createdAt' | 'updatedAt'  | 'processMessages'> {
                processMessages: (mongooseTypes.ObjectId | databaseTypes.I)[];
}
