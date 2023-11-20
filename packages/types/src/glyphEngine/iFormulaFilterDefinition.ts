import {FORMULA_SYNTAX, FILTER_TYPE} from './constants';
export interface IFormulaFilterDefinition {
  formulaSyntax: FORMULA_SYNTAX;
  filterType: FILTER_TYPE.FORMULA;
  //The input field names should be the display names as they appear in the axis and supportingFields sections not the column names directly (unless of course they match all the way through, but this would not be the case for formula fields)
  input: Record<string, string>;
  formula: string[];
}
