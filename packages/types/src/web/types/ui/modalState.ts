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
      type: MODAL_CONTENT_TYPE.CREATE_STATE;
      isSubmitting: boolean;
      data: any;
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
      type: MODAL_CONTENT_TYPE.DELETE_FILE;
      isSubmitting: boolean;
      data: {fileName: string};
    }
  | {
      type: MODAL_CONTENT_TYPE.FILE_DECISIONS;
      name?: string;
      desc?: string;
      isSubmitting: boolean;
      data: MatchingFileStatsData;
    }
  | {
      type: MODAL_CONTENT_TYPE.FILE_ERRORS;
      name?: string;
      desc?: string;
      isSubmitting: boolean;
      data: DuplicateColumnData;
    };
