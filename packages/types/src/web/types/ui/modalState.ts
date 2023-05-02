import {MODAL_CONTENT_TYPE} from '../../constants';
import {MatchingFileStatsData} from '../../interfaces';
import {IDeleteProjectData} from '../../interfaces/modals/iDeleteProjectData';
import {DuplicateColumnData} from '../fileRules/duplicateColumnData';

export type ModalState =
  | {
      type: MODAL_CONTENT_TYPE.CREATE_PROJECT;
      isSubmitting: boolean;
      data: {};
    }
  | {
      type: MODAL_CONTENT_TYPE.CREATE_WORKSPACE;
      isSubmitting: boolean;
      data: {};
    }
  | {
      type: MODAL_CONTENT_TYPE.DELETE_ACCOUNT;
      isSubmitting: boolean;
      data: {};
    }
  | {
      type: MODAL_CONTENT_TYPE.DELETE_WORKSPACE;
      isSubmitting: boolean;
      data: {};
    }
  | {
      type: MODAL_CONTENT_TYPE.DELETE_PROJECT;
      isSubmitting: boolean;
      data: IDeleteProjectData;
    }
  | {
      type: MODAL_CONTENT_TYPE.FILE_DECISIONS;
      isSubmitting: boolean;
      data: MatchingFileStatsData;
    }
  | {
      type: MODAL_CONTENT_TYPE.FILE_ERRORS;
      isSubmitting: boolean;
      data: DuplicateColumnData;
    };
