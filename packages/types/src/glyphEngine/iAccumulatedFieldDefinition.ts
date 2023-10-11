import {FIELD_DEFINITION_TYPE, ACCUMULATOR_TYPE} from './constants';
import {IFieldDefinition} from './iFieldDefinition';
export interface IAccumulatedFieldDefinition {
  fieldType: FIELD_DEFINITION_TYPE.ACCUMULATED;
  accumulatedFieldDefinition: IFieldDefinition;
  accumulator: ACCUMULATOR_TYPE;
}
