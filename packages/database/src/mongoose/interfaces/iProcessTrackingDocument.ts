import {databaseTypes} from 'types';

export interface IProcessTrackingDocument extends Omit<databaseTypes.IProcessTracking, 'ProcessName'> {
  processName: string;
}
