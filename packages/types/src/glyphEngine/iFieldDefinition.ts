import {IStandardFieldDefinition} from './iStandardFieldDefinition';
import {IFormulaFieldDefinition} from './iFormulaFieldDefinition';
import {IDateFieldDefinition} from './iDateFieldDefinition';
export type IFieldDefinition = IStandardFieldDefinition | IFormulaFieldDefinition | IDateFieldDefinition;
