import {MODAL_CONTENT_TYPE} from '../../constants/modalType';
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

export type ModalsAtom = {
  modals: ModalState[];
};

export type ModalProps<T extends ModalState> = {
  modalContent: T;
};

export type CreateProjectModalProps = ModalProps<
  Extract<ModalState, {type: MODAL_CONTENT_TYPE.CREATE_PROJECT}>
>;
export type CreateWorkspaceModalProps = ModalProps<
  Extract<ModalState, {type: MODAL_CONTENT_TYPE.CREATE_WORKSPACE}>
>;
export type DeleteAccountModalProps = ModalProps<
  Extract<ModalState, {type: MODAL_CONTENT_TYPE.DELETE_ACCOUNT}>
>;
export type DeleteProjectModalProps = ModalProps<
  Extract<ModalState, {type: MODAL_CONTENT_TYPE.DELETE_PROJECT}>
>;
export type DeleteWorkspaceModalProps = ModalProps<
  Extract<ModalState, {type: MODAL_CONTENT_TYPE.DELETE_WORKSPACE}>
>;
export type FileDecisionsModalProps = ModalProps<
  Extract<ModalState, {type: MODAL_CONTENT_TYPE.FILE_DECISIONS}>
>;
export type FileErrorsModalProps = ModalProps<
  Extract<ModalState, {type: MODAL_CONTENT_TYPE.FILE_ERRORS}>
>;

export type SplitPaneOrientation = 'vertical' | 'horizontal';
