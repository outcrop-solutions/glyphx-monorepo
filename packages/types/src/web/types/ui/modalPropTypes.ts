import {MODAL_CONTENT_TYPE} from '../../constants';
import {ModalProps} from './modalProps';
import {ModalState} from './modalState';

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
export type DeleteFileModalProps = ModalProps<
  Extract<ModalState, {type: MODAL_CONTENT_TYPE.DELETE_FILE}>
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
