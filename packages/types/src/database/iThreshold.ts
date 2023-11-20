import {Types as mongooseTypes} from 'mongoose';
import {ACTION_TYPE, THRESHOLD_OPERATOR} from './constants';

export interface IThreshold {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  name: string;
  actionType: ACTION_TYPE;
  actionPayload: Record<string, unknown>;
  value?: number;
  operator?: THRESHOLD_OPERATOR;
}
