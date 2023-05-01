import {IFileStats} from '../../../fileIngestion';
import {MODAL_CONTENT_TYPE} from '../../constants';
import {IFileDecisionData} from '../modals/iFileDecisionData';
import {IClientSidePayload} from './iClientSidePayload';

export interface IFileRule {
  type: MODAL_CONTENT_TYPE.FILE_DECISIONS | MODAL_CONTENT_TYPE.FILE_ERRORS;
  name: string;
  desc: string;
  condition?: (
    payload: IClientSidePayload,
    existingFiles: IFileStats[]
  ) => Record<string, any> | false;
  data?: IFileDecisionData;
}
