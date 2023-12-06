// THIS CODE WAS AUTOMATICALLY GENERATED 
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import { IActivityLogDocument } from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', ''); 
const RANDOM_NUMBER = Math.random(); 

export const MOCK_ACTIVITYLOG = {
      id: 'id',
          actor: {},
      workspace: {},
      project: {},
      location: 'location',
          userAgent: {},
      action: databaseTypes.ACTION_TYPE.CREATED,
      onModel: databaseTypes.RESOURCE_MODEL.USER,
} as any;