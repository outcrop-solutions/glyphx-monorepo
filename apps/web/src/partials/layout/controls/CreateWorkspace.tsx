import produce from 'immer';
import React from 'react';
import { useSetRecoilState } from 'recoil';
import { showModalAtom } from 'state';

export const CreateWorkspace = () => {
  const setShowCreateWorkspace = useSetRecoilState(showModalAtom);

  const handleNewWorkspace = () => {
    setShowCreateWorkspace(
      produce((draft) => {
        draft.type = 'createWorkspace';
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
