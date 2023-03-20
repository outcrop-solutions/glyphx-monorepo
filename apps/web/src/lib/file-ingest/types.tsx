import { _Object } from '@aws-sdk/client-s3';
import { IFileStats } from '@glyphx/types/src/fileIngestion';
import { FIELD_TYPE } from '@glyphx/types/src/fileIngestion/constants';

// THIS FLAG DETERMINES INITIAL TRANSFORMATION FROM S3 OR BROWSER "ACCEPTEDFILES"
export enum IngestionType {
  BROWSER,
  S3,
}

/**
 * S3 Rendering pipeline input
 */
type ListObjectsCommandOutputContent = _Object;

export interface S3ProviderListOutputItem {
  key: ListObjectsCommandOutputContent['Key'];
  eTag: ListObjectsCommandOutputContent['ETag'];
  lastModified: ListObjectsCommandOutputContent['LastModified'];
  size: ListObjectsCommandOutputContent['Size'];
}
export interface S3ProviderListOutput {
  results: S3ProviderListOutputItem[];
  nextToken?: string;
  hasNextToken: boolean;
}

/**
 * Local upload pipeline input
 */
export type BrowserInput = Blob[]; // local binary data from dropzone

/**
 * Project level file system
 */
export interface IFileSystemItem extends IFileStats {
  dataGrid: RenderableDataGrid;
  open: boolean;
}
export type IFileSystem = IFileSystemItem[];

export type OpenFile = {
  tableName: string; // to render header
  fileIndex: number; //index order in filesystem
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

/**
 * @note differs fromm IColumn for TailwindCSS purposes
 * */
export type GridColumn = {
  key: string;
  dataType: FIELD_TYPE;
  name: string;
  width: number;
  resizable: boolean;
  sortable: boolean;
};

export interface RenderableDataGrid {
  columns: GridColumn[];
  rows: any[];
}

// operations are executed in the order of the array

// ADD + REPLACE == ADD
// ADD + DELETE == REPLACE

// ADD + APPEND
// PEPLACE + APPEND
// DELETE +
