import {FILTER_TYPE} from './constants';
export interface IDescreteFilterDefinition {
  filterType: FILTER_TYPE.INCLUDE | FILTER_TYPE.EXCLUDE;
  filterValues: string[] | number[] | Date[];
}
