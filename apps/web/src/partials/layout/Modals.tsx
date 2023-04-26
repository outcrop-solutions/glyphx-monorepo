import React, { useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { showModalAtom } from 'state';
import ClickAwayListener from 'react-click-away-listener';

import { CreateWorkspaceModal } from 'partials/modals/CreateWorkspaceModal';
import { CreateProjectModal } from 'partials/modals/CreateProjectModal';
import produce from 'immer';
import { DeleteAccountModal } from 'partials/modals/DeleteAccountModal';
import { DeleteWorkspaceModal } from 'partials/modals/DeleteWorkspaceModal';
import { DeleteProjectModal } from 'partials/modals/DeleteProjectModal';
import { DeleteFileModal } from 'partials/modals/DeleteFileModal';

export const Modals = () => {
  const [modalContent, setModalContent] = useRecoilState(showModalAtom);

  const handleClickAway = () => {
    setModalContent(
      produce((draft) => {
        draft.type = false;
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
                  case 'createProject':
                    return <CreateProjectModal />;
                  case 'createWorkspace':
                    return <CreateWorkspaceModal />;
                  case 'deleteAccount':
                    return <DeleteAccountModal />;
                  case 'deleteWorkspace':
                    return <DeleteWorkspaceModal />;
                  case 'deleteProject':
                    return <DeleteProjectModal />;
                  case 'deleteFile':
                    return <DeleteFileModal />;
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
