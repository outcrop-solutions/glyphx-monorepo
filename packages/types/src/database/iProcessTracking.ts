import {Types as mongooseTypes} from 'mongoose';
import * as constants from './constants';

export interface IProcessTracking {
  _id?: mongooseTypes.ObjectId;
  processId: mongooseTypes.ObjectId;
  processName: string;
  processStatus: constants.PROCESS_STATUS;
  processStartTime: Date;
  processEndTime?: Date;
  processMessages: string[];
  processError: Record<string, unknown>[];
  processResult?: Record<string, unknown>;
}
