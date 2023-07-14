import {FIELD_TYPE} from '../../../fileIngestion/constants';
import {
  AXIS,
  ACCEPTS,
  INTERPOLATION_TYPE,
  DIRECTION_TYPE,
} from '../../constants';
import {Filter} from '../filter';

export type Property = {
  axis: AXIS;
  accepts: ACCEPTS;
  key: string; // corresponds to column name
  dataType: FIELD_TYPE; // corresponds to column data type
  interpolation: INTERPOLATION_TYPE;
  direction: DIRECTION_TYPE;
  filter: Filter;
  description?: string;
};
