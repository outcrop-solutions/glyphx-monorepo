import {IFileInformation, ITableSorter} from '../interfaces/fileProcessing';
import {error} from '@glyphx/core';

/**
 * Our basicTable sorter class.  This class sorts by the
 * product of rows * columns desceding.  If the product of
 * rows * columns is equal then file size will be used.
 */
export class BasicTableSorter implements ITableSorter {
  private sortedTablesField: IFileInformation[];
  /**
   * An accessor to retreive a previously sorted sert of
   * table data.  See {@link interfaces/fileProcessing/iTableSorter!ITableSorter.sortedTables } for more information.
   */
  get sortedTables(): IFileInformation[] {
    if (!this.sortedTablesField.length)
      throw new error.InvalidOperationError(
        'You must call sortTables before using this accessor to retreive the sorted data',
        {}
      );
    return this.sortedTablesField;
  }

  /**
   * Constructs a new BasicTableSorter.  See {@link interfaces/fileProcessing/iTableSorter!ITableSorter} for more information.
   */
  constructor() {
    this.sortedTablesField = [];
  }

  /**
   * Performs the bulk of the work for this class.  User
   * cell count (rows * columns) and fileSize to determine
   * sort order.  Larger cellcount/filsize tables appear
   * earlier in the sort. See {@link interfaces/fileProcessing/iTableSorter!ITableSorter.sortTables} for more information.
   * @param tableInformation - the table data to sort.
   */
  sortTables(tableInformation: IFileInformation[]): IFileInformation[] {
    const sortedData = tableInformation.sort((s1, s2) => {
      const cellCount1 = s1.numberOfRows * s1.numberOfColumns;
      const cellCount2 = s2.numberOfRows * s2.numberOfColumns;
      if (cellCount1 > cellCount2) return -1;
      else if (cellCount1 < cellCount2) return 1;
      else if (s1.fileSize > s2.fileSize) return -1;
      else return 1;
    });

    this.sortedTablesField = sortedData;
    return sortedData;
  }
}
