import {IDescreteFilterDefinition} from './iDescreteFilterDefinition';
import {IFormulaFilterDefinition} from './iFormulaFilterDefinition';
import {IRangeFilterDefinition} from './iRangeFilterDefinition';

export type IFilterDefinition = IDescreteFilterDefinition | IRangeFilterDefinition | IFormulaFilterDefinition;
