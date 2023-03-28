import {FILTER_TYPE} from '../../constants/filterType';

export interface INumbericFilter {
  type: FILTER_TYPE.NUMBER;
  name: string;
  min: number;
  max: number;
}
