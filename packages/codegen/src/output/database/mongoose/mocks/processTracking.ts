// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from '../../../../../database';
import {IProcessTrackingDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_PROCESSTRACKING = {
  processId: 'processId',
  processName: 'processName',
  processStatus: databaseTypes.PROCESS_STATUS.PENDING,
  processStartTime: 'processStartTime',
  processEndTime: 'processEndTime',
  processMessages: [],
  processError: {},
  processResult: {},
  processHeartbeat: 'processHeartbeat',
} as unknown as IProcessTrackingDocument;
