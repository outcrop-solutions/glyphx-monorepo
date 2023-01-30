import {IFileStats} from './iFileStats';
import {IFileInfo} from './iFileInfo';

export interface IPayload {
  clientId: string;
  modelId: string;
  bucketName: string;
  fileStats: IFileStats[];
  fileInfo: IFileInfo[];
}
