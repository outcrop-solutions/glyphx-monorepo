import {FIELD_TYPE} from '../../../fileIngestion/constants';

export interface ILastDroppedItem {
  key: string; // corresponds to column name
  dataType: FIELD_TYPE; // corresponds to column data type
}
