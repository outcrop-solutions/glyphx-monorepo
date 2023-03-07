import {database as databaseTypes} from '@glyphx/types';

export interface IProcessTrackingDocument
  extends Omit<databaseTypes.IProcessTracking, 'ProcessName'> {
  processName: string;
}
