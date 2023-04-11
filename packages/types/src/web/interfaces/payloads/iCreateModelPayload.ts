import {Types as mongooseTypes} from 'mongoose';
import {INTERPOLATION_TYPE, DIRECTION_TYPE} from '../../constants';

// object to map on api call
export interface ICreateModelPayload {
  model_id: mongooseTypes.ObjectId | string;
  client_id: mongooseTypes.ObjectId | string;
  x_axis: string;
  y_axis: string;
  z_axis: string;
  type_x: string; // 'string' | 'number'
  type_y: string; // 'string' | 'number'
  type_z: string; // 'string' | 'number'
  filter: string; // SQL QUERY AFTER THE 'WHERE' CLAUSE
  x_func?: INTERPOLATION_TYPE;
  y_func?: INTERPOLATION_TYPE;
  z_func?: INTERPOLATION_TYPE;
  x_direction?: DIRECTION_TYPE;
  y_direction?: DIRECTION_TYPE;
  z_direction?: DIRECTION_TYPE;
}
