import {Types as mongooseTypes} from 'mongoose';
import {INTERPOLATION_TYPE, DIRECTION_TYPE} from '../../constants';

export interface ICreateModelPayload {
  model_id: mongooseTypes.ObjectId | string;
  user_id: mongooseTypes.ObjectId | string;
  x_axis: string;
  y_axis: string;
  z_axis: string;
  filter: string; // SQL QUERY AFTER THE 'WHERE' CLAUSE
  x_func: INTERPOLATION_TYPE;
  y_func: INTERPOLATION_TYPE;
  z_func: INTERPOLATION_TYPE;
  x_direction: DIRECTION_TYPE;
  y_direction: DIRECTION_TYPE;
  z_direction: DIRECTION_TYPE;
}
