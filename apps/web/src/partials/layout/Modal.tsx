import React from 'react';
import { useSetRecoilState } from 'recoil';
import { modalsAtom } from 'state';
import ClickAwayListener from 'react-click-away-listener';
import { web as webTypes } from '@glyphx/types';

import { CreateWorkspaceModal } from 'partials/modals/CreateWorkspaceModal';
import { CreateProjectModal } from 'partials/modals/CreateProjectModal';
import produce from 'immer';
import { DeleteAccountModal } from 'partials/modals/DeleteAccountModal';
import { DeleteWorkspaceModal } from 'partials/modals/DeleteWorkspaceModal';
import { DeleteProjectModal } from 'partials/modals/DeleteProjectModal';
import { FileErrorsModal } from 'partials/modals/FileErrorsModal';
import { FileDecisionModal } from 'partials/modals/FileDecisionModal';
import { WritableDraft } from 'immer/dist/internal';
import { DeleteFileModal } from 'partials/modals/DeleteFileModal';
import { CreateStateModal, DeleteStateModal, UpdateStateModal } from 'partials/modals';
import { AIRecommendationsModal } from 'partials/modals/AIRecommendationsModal';
import { CreateProjectTemplateModal } from 'partials/modals/CreateProjectTemplateModal';

export const Modal = ({ modalContent }: { modalContent: webTypes.ModalState }) => {
  const setModals = useSetRecoilState(modalsAtom);

  // pop current modal off the stack
  const handleClickAway = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.splice(0, 1);
      })
    );
  };

  return (
    <>
      {modalContent?.type ? (
        <div className="fixed w-screen h-screen flex justify-center items-center bg-gray bg-opacity-50 z-[90]">
          <ClickAwayListener onClickAway={handleClickAway}>
            <div>
              {(() => {
                switch (modalContent.type) {
                  case webTypes.constants.MODAL_CONTENT_TYPE.AI_RECOMMENDATIONS:
                    return (
                      <AIRecommendationsModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.AI_RECOMMENDATIONS }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.CREATE_PROJECT_TEMPLATE:
                    return (
                      <CreateProjectTemplateModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.CREATE_PROJECT_TEMPLATE }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.CREATE_PROJECT:
                    return (
                      <CreateProjectModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.CREATE_PROJECT }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.CREATE_STATE:
                    return (
                      <CreateStateModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.CREATE_STATE }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.UPDATE_STATE:
                    return (
                      <UpdateStateModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.UPDATE_STATE }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.DELETE_STATE:
                    return (
                      <DeleteStateModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.DELETE_STATE }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.CREATE_WORKSPACE:
                    return (
                      <CreateWorkspaceModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.CREATE_WORKSPACE }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.DELETE_ACCOUNT:
                    return (
                      <DeleteAccountModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.DELETE_ACCOUNT }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.DELETE_WORKSPACE:
                    return (
                      <DeleteWorkspaceModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.DELETE_WORKSPACE }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.DELETE_PROJECT:
                    return (
                      <DeleteProjectModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.DELETE_PROJECT }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.DELETE_FILE:
                    return (
                      <DeleteFileModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.DELETE_FILE }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.FILE_DECISIONS:
                    return (
                      <FileDecisionModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.FILE_DECISIONS }
                          >
                        }
                      />
                    );
                  case webTypes.constants.MODAL_CONTENT_TYPE.FILE_ERRORS:
                    return (
                      <FileErrorsModal
                        modalContent={
                          modalContent as Extract<
                            webTypes.ModalState,
                            { type: typeof webTypes.constants.MODAL_CONTENT_TYPE.FILE_ERRORS }
                          >
                        }
                      />
                    );
                  default:
                    return <></>;
                }
              })()}
            </div>
          </ClickAwayListener>
        </div>
      ) : null}
    </>
  );
};
