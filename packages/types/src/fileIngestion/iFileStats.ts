import {IColumn} from './iColumn';

export interface IFileStats {
  fileName: string;
  tableName: string;
  numberOfRows: number;
  numberOfColumns: number;
  columns: IColumn[];
  fileSize: number;
}

