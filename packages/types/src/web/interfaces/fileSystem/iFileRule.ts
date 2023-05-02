import {IFileStats} from '../../../fileIngestion';
import {MODAL_CONTENT_TYPE} from '../../constants';
import {IClientSidePayload} from './iClientSidePayload';
import {MatchingFileStatsData} from '../../types/fileRules/matchingFileStatsData';
import {DuplicateColumnData} from '../../types/fileRules/duplicateColumnData';

export interface IFileRule {
  type: MODAL_CONTENT_TYPE.FILE_DECISIONS | MODAL_CONTENT_TYPE.FILE_ERRORS;
  name: string;
  isSubmitting?: boolean;
  desc: string;
  condition?: (
    payload: IClientSidePayload,
    existingFiles: IFileStats[]
  ) => DuplicateColumnData | MatchingFileStatsData;
  data?: DuplicateColumnData | MatchingFileStatsData;
}
