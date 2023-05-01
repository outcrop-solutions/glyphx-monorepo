import {MODAL_CONTENT_TYPE} from '../../constants';
import {IMatchingFileStats} from '../../interfaces';
import {IDeleteProjectData} from '../../interfaces/modals/iDeleteProjectData';
import {IFileDecisionData} from '../../interfaces/modals/iFileDecisionData';

export type ModalState =
  | {
      type: MODAL_CONTENT_TYPE.CREATE_PROJECT;
      isSubmitting: boolean;
      data: false;
    }
  | {
      type: MODAL_CONTENT_TYPE.CREATE_WORKSPACE;
      isSubmitting: boolean;
      data: false;
    }
  | {
      type: MODAL_CONTENT_TYPE.DELETE_ACCOUNT;
      isSubmitting: boolean;
      data: false;
    }
  | {
      type: MODAL_CONTENT_TYPE.DELETE_WORKSPACE;
      isSubmitting: boolean;
      data: false;
    }
  | {
      type: MODAL_CONTENT_TYPE.DELETE_PROJECT;
      isSubmitting: boolean;
      data: IDeleteProjectData;
    }
  | {
      type: MODAL_CONTENT_TYPE.FILE_DECISIONS;
      isSubmitting: boolean;
      data: IFileDecisionData;
    }
  | {
      type: MODAL_CONTENT_TYPE.FILE_ERRORS;
      isSubmitting: boolean;
      data: IMatchingFileStats;
    };
