import React from 'react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { useSetRecoilState } from 'recoil';
import { modalsAtom } from 'state';
import { webTypes } from 'types';

export const CreateWorkspace = () => {
  const setModals = useSetRecoilState(modalsAtom);

  const handleNewWorkspace = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.CREATE_WORKSPACE,
          isSubmitting: false,
          data: {},
        });
      })
    );
  };

  return (
    <button
      onClick={() => handleNewWorkspace()}
      className="flex items-center justify-around w-full bg-gray px-2 py-2 rounded disabled:opacity-75 text-white"
    >
      <span className="text-white whitespace-nowrap">Create Workspace</span>
    </button>
  );
};
