import {FILTER_TYPE} from './constants';
export interface IRangeFilterDefinition {
  filterType: FILTER_TYPE.INCLUDE_BY_RANGE | FILTER_TYPE.EXCLUDE_BY_RANGE;
  minValue: string | number | Date;
  maxValue: string | number | Date;
}
