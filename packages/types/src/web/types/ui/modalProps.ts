import {ModalState} from './modalState';

export type ModalProps<T extends ModalState> = {
  modalContent: T;
};
