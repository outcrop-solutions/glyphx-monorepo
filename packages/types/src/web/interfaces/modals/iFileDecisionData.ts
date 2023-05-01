import {File} from 'buffer';
import {IFileInfo} from '../../../fileIngestion';
import {IClientSidePayload} from '../fileSystem/iClientSidePayload';

export interface IFileDecisionData {
  payload: IClientSidePayload;
  fileOps: IFileInfo;
  acceptedFiles: File[];
}
