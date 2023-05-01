import React from 'react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { useSetRecoilState } from 'recoil';
import { showModalAtom } from 'state';
import { web as webTypes } from '@glyphx/types';

export const CreateWorkspace = () => {
  const setShowCreateWorkspace = useSetRecoilState(showModalAtom);

  const handleNewWorkspace = () => {
    setShowCreateWorkspace(
      produce((draft: WritableDraft<webTypes.ModalsAtom>) => {
        draft.type = webTypes.constants.MODAL_CONTENT_TYPE.CREATE_WORKSPACE;
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
