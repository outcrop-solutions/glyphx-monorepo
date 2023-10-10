import {FIELD_TYPE} from '../fileIngestion/constants';
import {IAccumulatedFieldDefinition} from './iAccumulatedFieldDefinition';
import {IAxis} from './iAxis';
export interface IZAxis extends Omit<IAxis, 'fieldDefinition'> {
  fieldDefinition: IAccumulatedFieldDefinition;
  fieldDataType: FIELD_TYPE.NUMBER;
}
