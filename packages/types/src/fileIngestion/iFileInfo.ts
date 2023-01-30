import {Readable} from 'node:stream';
import {FILE_OPERATION} from './constants';

export interface IFileInfo {
  tableName: string;
  fileName: string;
  operation: FILE_OPERATION;
  fileStream: Readable;
}
