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

export const Modal = ({ modalContent }) => {
  const setModals = useSetRecoilState(modalsAtom);

  // pop current modal off the stack
  const handleClickAway = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.ModalsAtom>) => {
        draft.modals.splice(0, 1);
      })
    );
  };

  return (
    <>
      {modalContent.type ? (
        <div className="fixed w-screen h-screen flex justify-center items-center bg-gray bg-opacity-50 z-60">
          <ClickAwayListener onClickAway={handleClickAway}>
            <div>
              {(() => {
                switch (modalContent.type) {
                  case webTypes.constants.MODAL_CONTENT_TYPE.CREATE_PROJECT:
                    return <CreateProjectModal modalContent={modalContent} />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.CREATE_WORKSPACE:
                    return <CreateWorkspaceModal modalContent={modalContent} />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.DELETE_ACCOUNT:
                    return <DeleteAccountModal modalContent={modalContent} />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.DELETE_WORKSPACE:
                    return <DeleteWorkspaceModal modalContent={modalContent} />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.DELETE_PROJECT:
                    return <DeleteProjectModal modalContent={modalContent} />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.FILE_DECISIONS:
                    return <FileDecisionModal modalContent={modalContent} />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.FILE_ERRORS:
                    return <FileErrorsModal modalContent={modalContent} />;
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
