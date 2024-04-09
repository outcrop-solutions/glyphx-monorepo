import {IStandardFieldDefinition} from './iStandardFieldDefinition';
import {IDateFieldDefinition} from './iDateFieldDefinition';
import {AccumulatorType} from './constants/accumulatorType';
export interface IAccumulatedFieldDefinition {
  fieldType: 'accumulated';
  accumulatorType: AccumulatorType;
  accumulatedField: IStandardFieldDefinition | IDateFieldDefinition;
}
