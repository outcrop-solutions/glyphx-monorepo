// THIS CODE WAS AUTOMATICALLY GENERATED
import {v4} from 'uuid';
import {databaseTypes} from 'types';
import {IThresholdDocument} from '../interfaces';
const UNIQUE_KEY = v4().replaceAll('-', '');
const RANDOM_NUMBER = Math.random();

export const MOCK_THRESHOLD = {
  id: 'id',
  name: 'name',
  actionType: databaseTypes.ACTION_TYPE.CREATED,
  actionPayload: {},
  value: 'value',
  operator: databaseTypes.THRESHOLD_OPERATOR.GT,
} as any;
