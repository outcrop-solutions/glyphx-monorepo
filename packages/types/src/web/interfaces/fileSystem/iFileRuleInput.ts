import {File} from 'buffer';
import {IFileStats} from '../../../fileIngestion';
import {IClientSidePayload} from './iClientSidePayload';

export interface IFileRuleInput {
  payload: IClientSidePayload;
  existingFiles: IFileStats;
  acceptedFiles: File[];
}
