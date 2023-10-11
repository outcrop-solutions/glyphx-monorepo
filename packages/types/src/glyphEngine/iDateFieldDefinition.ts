import {FIELD_DEFINITION_TYPE, DATE_GROUPING} from './constants';
export interface IDateFieldDefinition {
  fieldType: FIELD_DEFINITION_TYPE.DATE;
  fieldName: string;
  dateGrouping: DATE_GROUPING;
}
