'use client';
import React from 'react';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {useSetRecoilState} from 'recoil';
import {modalsAtom} from 'state';
import {webTypes} from 'types';

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
      className="flex items-center bg-secondary-deep-blue justify-around w-full px-2 py-2 border-t border-white text-white"
    >
      <span className="text-white whitespace-nowrap text-sm">Create Workspace</span>
    </button>
  );
};
