import * as fileProcessingInterfaces from '@interfaces/fileProcessing';
import {error} from 'glyphx-core';

/**
 * IJoinData is an internal interface for holding temorary join information.
 *
 */
interface IJoinData extends fileProcessingInterfaces.IJoinTableDefinition {
  joinColumns: fileProcessingInterfaces.IJoinTableColumnDefinition[];
}
/**
 * creates an array of IJoinTableDefinitions that
 * define how table relate to each other.  The primary external interface
 * for clients in the processColumns function.
 */
export class BasicJoinProcessor
  implements fileProcessingInterfaces.IJoinProcessor
{
  /**
   *  The tables that have been processed by the join processor.
   */
  private processedTables: fileProcessingInterfaces.IJoinTableDefinition[];

  /**
   * The value of the zero based index of the last/current processed file.
   */
  private currentIndex: number;

  /**
   * The value of the Alias of the last/current processed file.  The Alias is
   * calculated as 'A' + current index.
   */
  private currentAlias: string;

  /**
   * Exposes our processed tables to the outside world.
   */
  public get joinData(): fileProcessingInterfaces.IJoinTableDefinition[] {
    return this.processedTables;
  }
  /**
   * The constructor
   */
  constructor() {
    this.processedTables = [];
    this.currentIndex = -1;
    this.currentAlias = '@'; //A - 1, consult your handy ASCII chart
  }

  //TODO: we may also want to remove any other special characters i.e. # or $
  /**
   * standardizes the table name so that duplicate tables are not included.
   *
   * @param tableName -- the name of the table to clean.
   */
  private cleanTableName(tableName: string) {
    return tableName.trim().toLowerCase();
  }

  /**
   * Processes the IFieldDefinition[] values and adds them to
   * an existing IJoinTableDefinition.
   *
   * @param table -- the table to which to add the columns.
   * @param columns -- the fields to be processed into columns
   */
  private addColumns(
    table: fileProcessingInterfaces.IJoinTableDefinition,
    columns: fileProcessingInterfaces.IFieldDefinition[]
  ): void {
    columns.forEach((c, index) => {
      table.columns.push({
        tableDefinition: table,
        columnIndex: index,
        columnName: c.name,
        columnType: c.fieldType,
        isJoinColumn: false,
        isSelectedColumn: true,
      });
    });
  }

  /**
   * Adds a table to this.processedTables
   *
   * @param tableName -- the name of the table to add (should already be cleaned)
   * @param backingFileName -- the name of the file that holds the tables data.
   * @param columns -- the fields that are included in the table.
   */
  private addTable(
    tableName: string,
    backingFileName: string,
    columns: fileProcessingInterfaces.IFieldDefinition[]
  ): fileProcessingInterfaces.IJoinTableDefinition {
    this.currentAlias = String.fromCharCode(
      this.currentAlias.charCodeAt(0) + 1
    );
    const newProcessedTable: fileProcessingInterfaces.IJoinTableDefinition = {
      tableName: tableName,
      tableIndex: ++this.currentIndex,
      tableAlias: this.currentAlias,
      backingFileName: backingFileName,
      columns: [],
    };
    this.addColumns(newProcessedTable, columns);
    this.processedTables.push(newProcessedTable);
    return newProcessedTable;
  }

  /**
   * checks processedTables to see if the table has already been added.
   *
   * @param tableName -- the name of the table (should already be cleaned).
   *
   * @returns true if the table exists
   */
  private doesTableExist(tableName: string): boolean {
    const retVal = this.processedTables.find(t => t.tableName === tableName)
      ? true
      : false;
    return retVal;
  }

  /**
   * this is the main processing point for this class.  It will process a table and it's columns
   * and determine the best way to join the tables.  This function assumes that the tables
   * are passed in the order that they should be evaluated ... left to right.  Said another way,
   * this version of the class will always try to join left to right so it is the callers
   * responsibility to endire that the tables are in a sensible order.
   *
   * @param tableName -- the name of the table to process.
   * @param columns -- the fields to process as part of this table.
   *
   * @throws error.InvalidArgumentError -- if the tableName already exists.
   */
  public processColumns(
    tableName: string,
    backingTableName: string,
    columns: fileProcessingInterfaces.IFieldDefinition[]
  ) {
    //1. check for an existing table
    //2. if the table already exisits what should we do?  For now lets just throw an error
    const cleanTableName = this.cleanTableName(tableName);
    if (this.doesTableExist(cleanTableName))
      throw new error.InvalidArgumentError(
        `A table with the name ${tableName} already exists`,
        'tableName',
        tableName
      );

    const newTable = this.addTable(cleanTableName, backingTableName, columns);

    //if this is the first table there is nothing to join to
    //so no need to do any more processing
    if (this.processedTables.length !== 1) {
      this.processJoins(newTable);
    }
  }

  /**
   * this function will take a table and determine the
   * join information for it.  For this application, we are only processing these
   * as left outer joins, so we will not re-calculate the joins to tables already
   * defined.  A join is calculated by comparing column names and field types to
   * tables in the processedTables array. The most matching columns wins.  In the
   * case of a tie, the table will be joined to the table with the lower index
   *
   * @param table  the table that are joining to the other tables
   *
   *
   */
  private processJoins(
    table: fileProcessingInterfaces.IJoinTableDefinition
  ): void {
    const joinTablesData: IJoinData[] = [];
    this.processedTables.forEach(processedTable => {
      //no self joins, that would make things a mess
      if (processedTable.tableIndex !== table.tableIndex) {
        const joinTable = Object.assign({}, processedTable) as IJoinData;

        const matchingColumns = joinTable.columns.filter(joinTablecolumn => {
          const isMatch = table.columns.find(
            tableColumn =>
              joinTablecolumn.columnName === tableColumn.columnName &&
              joinTablecolumn.columnType === tableColumn.columnType
          );

          if (isMatch) return true;
          else return false;
        });
        if (matchingColumns.length) {
          joinTable.joinColumns = matchingColumns;
          joinTablesData.push(joinTable);
        }
      }
    });
    //do we have at least one table to join to
    if (joinTablesData.length) {
      joinTablesData.sort((s1, s2) => {
        if (s1.joinColumns.length === s2.joinColumns.length) {
          //In this instance, the array is already ordered
          //by tableIndex.  S1 will always have a index greater than S2, so returning 1 should give us the result that we want.
          //At least this is what I see in testing.
          return 1;
        } else if (s1.joinColumns.length > s2.joinColumns.length) {
          return -1;
        } else return 1;
      });

      const joinTable = joinTablesData[0];
      const joinTableDefinition = this.processedTables[joinTable.tableIndex];
      table.joinTable = joinTableDefinition;
      table.columns.forEach(c => {
        if (
          joinTable.columns.find(jc => {
            return (
              jc.columnName === c.columnName && jc.columnType === c.columnType
            );
          })
        ) {
          c.isJoinColumn = true;
          c.isSelectedColumn = false; //If we are joining on this column then we do not need to display it
        }
      });
    }
  }
}

export default BasicJoinProcessor;
