import {DateGrouping} from './constants/dateGrouping';
export interface IDateFieldDefinition {
  fieldType: 'date';
  fieldName: string;
  dateGrouping: DateGrouping;
}
