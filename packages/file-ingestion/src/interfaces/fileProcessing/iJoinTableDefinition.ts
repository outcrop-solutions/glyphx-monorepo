import {IJoinTableColumnDefinition} from './iJoinTableColumnDefinition';

/**
 *  An interface to define join information betweeen a set of tables.
 */
export interface IJoinTableDefinition {
  /**
   * The name of the table
   */
  tableName: string;

  /**
   * The name of the s3 file that backs
   * this table
   */
  backingFileName: string;

  /**
   * The index number of the table in a set.  This should be unique in the set
   */
  tableIndex: number;
  /**
   * An alias for the table.  This should be unique within the set.
   */
  tableAlias: string;
  /**
   * The table that this table is joined to.  This can be undefined if the
   * table is the left most table or if it included in the set but no join
   * information can be calculated.
   */
  joinTable?: IJoinTableDefinition;
  /**
   * The columns defined for this table.
   */
  columns: IJoinTableColumnDefinition[];
}

export default IJoinTableDefinition;
