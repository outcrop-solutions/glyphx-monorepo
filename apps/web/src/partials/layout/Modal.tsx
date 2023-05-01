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

export const Modal = ({ modalContent, idx }) => {
  const setModals = useSetRecoilState(modalsAtom);

  const handleClickAway = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.ModalsAtom>) => {
        draft.modals.splice(idx, 1);
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
                    return <CreateProjectModal />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.CREATE_WORKSPACE:
                    return <CreateWorkspaceModal />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.DELETE_ACCOUNT:
                    return <DeleteAccountModal />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.DELETE_WORKSPACE:
                    return <DeleteWorkspaceModal />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.DELETE_PROJECT:
                    return <DeleteProjectModal />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.FILE_DECISIONS:
                    return <FileDecisionModal />;
                  case webTypes.constants.MODAL_CONTENT_TYPE.FILE_ERRORS:
                    return <FileErrorsModal />;
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
