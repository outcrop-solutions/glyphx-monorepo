import {FIELD_TYPE} from '../../../fileIngestion/constants';

export interface IStringFilter {
  type: FIELD_TYPE.STRING;
  name: string;
  keywords: string[];
}
