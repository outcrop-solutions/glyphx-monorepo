import {IStandardFieldDefinition} from './iStandardFieldDefinition';
import {IDateFieldDefinition} from './iDateFieldDefinition';
import {AccumulatorType} from './constants/accumulatorType';
export interface IAccumulatedFieldDefinition {
  fieldType: 'accumulated';
  accumulator: AccumulatorType;
  accumulatedFieldDefinition: IStandardFieldDefinition | IDateFieldDefinition;
}
