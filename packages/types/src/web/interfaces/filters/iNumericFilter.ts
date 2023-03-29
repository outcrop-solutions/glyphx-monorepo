import {FIELD_TYPE} from '../../../fileIngestion/constants';

export interface INumbericFilter {
  type: FIELD_TYPE.NUMBER;
  min: number;
  max: number;
}
