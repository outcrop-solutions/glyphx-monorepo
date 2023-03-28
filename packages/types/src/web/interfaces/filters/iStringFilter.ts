import {FILTER_TYPE} from '../../constants/filterType';

export interface IStringFilter {
  type: FILTER_TYPE.STRING;
  name: string;
  keywords: string[];
}
