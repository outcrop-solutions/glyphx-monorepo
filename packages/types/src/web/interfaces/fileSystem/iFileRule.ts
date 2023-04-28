import {IFileStats} from '../../../fileIngestion';
import {ModalContent} from '../../types';
import {IClientSidePayload} from './iClientSidePayload';

export interface IFileRule {
  type: ModalContent;
  name: string;
  desc: string;
  condition?: (
    payload: IClientSidePayload,
    existingFiles: IFileStats[]
  ) => Record<string, any> | false; // should return relevant data to be displayed in modal
  data?: Record<string, unknown>;
}
