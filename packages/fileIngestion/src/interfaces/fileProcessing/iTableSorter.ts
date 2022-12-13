import {IFileInformation} from './iFileInformation';
/**
 * This interface is used to describe the shape of TableSorter classes.
 * TableSorters are used to sort tables before they are sent to the join processors.
 * This hopefully provides some sanity to the process of determining the joins.
 */
export interface ITableSorter {
  /**
   * Classes implimenting this interface should keep track
   * of the results of the last sort.  This accessor will p
   * provide access to that information.
   *
   * @throws InvalidOperationError - if no sort information is present.
   */
  get sortedTables(): IFileInformation[];
  /**
   * takes our tables and sorts them.  This does not alter the data supplied, but creates a new sirted array.
   *
   * @param tableInformation - information about the tables that are to be sorted.
   */
  sortTables(tableInformation: IFileInformation[]): IFileInformation[];
}

/**
 * this interface defines pluggable classes that can
 * be passed as function parameters to allow a consumer
 * in a dependecy injection scenario to control the lifetime
 * of the table sorter.
 */
export interface IConstructableTableSorter {
  /**
   * Our consructor builds a new instance of an {@link ITableSorter}
   */
  new (): ITableSorter;
}
