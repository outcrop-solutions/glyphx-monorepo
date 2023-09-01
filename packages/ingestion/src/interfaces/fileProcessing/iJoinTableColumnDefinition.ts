import {IJoinTableDefinition} from './iJoinTableDefinition';
import {fileIngestionTypes} from 'types';
/**
 * Defines join informaton for individual columns in a table.
 */
export interface IJoinTableColumnDefinition {
  /**
   * The table object to which this column belongs
   */
  tableDefinition: IJoinTableDefinition;
  /**
   * The collumn index number for the column in the set defined by the table
   */
  columnIndex: number;
  /**
   * The name of the column
   */
  columnName: string;
  /**
   * The data type of the column
   */
  columnType: fileIngestionTypes.constants.FIELD_TYPE;
  /**
   * For string types, we need to specify a length.  This
   * optional field will hold that value.
   */
  columnLength?: number;
  /**
   * If this column is used in the join this will be set to true
   */
  isJoinColumn: boolean;
  /**
   * If this column is not to be included in the output this wil be set to false.
   * Typically, if a column is a join column, it will not be included.
   */
  isSelectedColumn: boolean;
}

export default IJoinTableColumnDefinition;
