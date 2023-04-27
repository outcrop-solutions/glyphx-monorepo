import {Types as mongooseTypes} from 'mongoose';
import {IFileInfo, IFileStats} from '../../../fileIngestion';

export interface IClientSidePayload {
  clientId: string | mongooseTypes.ObjectId;
  modelId: string | mongooseTypes.ObjectId;
  bucketName: string;
  fileStats: IFileStats[];
  fileInfo: Omit<IFileInfo, 'fileStream'>[];
}
