import {FieldDataType} from './constants/fieldDataType';
import {IStandardFieldDefinition} from './iStandardFieldDefinition';
import {IDateFieldDefinition} from './iDateFieldDefinition';
import {IAccumulatedFieldDefinition} from './iAccumulatedFieldDefinition';
export interface IFieldDefinition {
  fieldDisplayName: string;
  fieldDataType: FieldDataType;
  fieldDefinition: IStandardFieldDefinition | IDateFieldDefinition | IAccumulatedFieldDefinition;
}
