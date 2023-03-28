import {IFileStats} from '../fileIngestion';
import {FIELD_TYPE} from '../fileIngestion/constants';

/**
 * Local upload pipeline input
 * encapsulates local binary data from dropzones
 */
export type BrowserInput = Blob[];

/**
 * Project level file system
 */
export type FileSystem = IFileSystemItem[];

export interface IFileSystemItem extends IFileStats {
  dataGrid: IRenderableDataGrid;
  open: boolean;
}

export interface IRenderableDataGrid {
  columns: GridColumn[];
  rows: any[];
}

/**
 * @note differs fromm IColumn for styling purposes
 * */
export type GridColumn = {
  key: string;
  dataType: FIELD_TYPE;
  name: string;
  width: number;
  resizable: boolean;
  sortable: boolean;
};

export type OpenFile = {
  tableName: string; // to render header
  fileIndex: number; // index order in filesystem
};

/**
 * @note Indexes are 0 based, -1 denotes none selected
 *  */
export type SelectedIndex = {
  index: number;
};

/**
 * Renderable list of matching file stats
 */
export interface IMatchingFileStats {
  new: IFileStats;
  existing: IFileStats;
}
