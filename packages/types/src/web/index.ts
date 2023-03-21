import {_Object} from '@aws-sdk/client-s3';
import {IFileStats} from '../fileIngestion';
import {FIELD_TYPE} from '../fileIngestion/constants';

export interface IFetchConfig {
  url: string;
  options: any;
  successMsg: string;
}

export interface IFrontendApiReq {
  url: string;
  options: any;
  setLoading?: (loading?: boolean) => void;
  onError?: (status: number) => void | null;
  onSuccess?: (data: any) => void | null;
  successMsg?: string;
}

export enum HTTP_METHOD {
  CONNECT = 'CONNECT',
  DELETE = 'DELETE',
  GET = 'GET',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
  PATCH = 'PATCH',
  POST = 'POST',
  PUT = 'PUT',
  TRACE = 'TRACE',
}

// THIS FLAG DETERMINES INITIAL TRANSFORMATION FROM S3 OR BROWSER "ACCEPTEDFILES"
export enum INGESTION_TYPE {
  BROWSER,
  S3,
}

// S3 Rendering pipeline input
type ListObjectsCommandOutputContent = _Object;

export interface IS3ProviderListOutputItem {
  key: ListObjectsCommandOutputContent['Key'];
  eTag: ListObjectsCommandOutputContent['ETag'];
  lastModified: ListObjectsCommandOutputContent['LastModified'];
  size: ListObjectsCommandOutputContent['Size'];
}

export interface IS3ProviderListOutput {
  results: IS3ProviderListOutputItem[];
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
  dataGrid: IRenderableDataGrid;
  open: boolean;
}
export type FileSystem = IFileSystemItem[];

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

export interface IRenderableDataGrid {
  columns: GridColumn[];
  rows: any[];
}

// operations are executed in the order of the array

// ADD + REPLACE == ADD
// ADD + DELETE == REPLACE

// ADD + APPEND
// PEPLACE + APPEND
// DELETE +
