import {FIELD_DEFINITION_TYPE, FORMULA_SYNTAX} from './constants';
export interface IFormulaFieldDefinition {
  fieldType: FIELD_DEFINITION_TYPE.FORMULA;
  formula: Record<string, any>;
  formulaSyntax: FORMULA_SYNTAX;
}
