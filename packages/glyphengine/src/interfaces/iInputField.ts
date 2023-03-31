import {TYPE} from '../constants';
import {TextColumnToNumberConverter} from '../io/textToNumberConverter';
export interface IInputField {
  name: string;
  id: string;
  table: string;
  field: string;
  type: TYPE;
  min: number;
  max: number;
  text_to_num?: TextColumnToNumberConverter;
}
