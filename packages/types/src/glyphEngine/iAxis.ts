import {IFieldDefinition} from './iFieldDefinition';
import {FIELD_TYPE} from '../fileIngestion/constants';
export interface IAxis {
  fieldDisplayName: string;
  fieldDataType: FIELD_TYPE;
  fieldDefinition: IFieldDefinition;
}
