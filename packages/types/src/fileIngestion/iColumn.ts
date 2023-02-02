import {FIELD_TYPE} from './constants';
export interface IColumn {
  name: string;
  fieldType: FIELD_TYPE;
  longestString?: number | undefined;
}
