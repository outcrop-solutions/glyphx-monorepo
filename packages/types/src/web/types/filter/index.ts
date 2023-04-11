import {IStringFilter} from '../../interfaces/filters/iStringFilter';
import {INumbericFilter} from '../../interfaces/filters/iNumericFilter';

/**
 * The filter type allows a discriminated union
 * of the two filter types via the "type" property
 */

export type Filter = INumbericFilter | IStringFilter;
