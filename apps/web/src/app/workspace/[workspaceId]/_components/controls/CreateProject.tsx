'use client';
import React from 'react';
import NewProjectIcon from 'svg/new-project-icon.svg';
import {useSetRecoilState} from 'recoil';
import {modalsAtom} from 'state';
import produce from 'immer';
import {webTypes} from 'types';
import {WritableDraft} from 'immer/dist/internal';

const btnTextPrimary = 'text-black font-roboto font-medium leading-[16px] pl-1';

const btnPrimary =
  'h-6 p-1 flex items-center justify-center bg-yellow border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const CreateProject = () => {
  const setModals = useSetRecoilState(modalsAtom);

  const handleNewProject = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.CREATE_PROJECT,
          isSubmitting: false,
          data: {},
        });
      })
    );
  };

  return (
    <button className={`${btnPrimary}`} onClick={() => handleNewProject()} aria-controls="create-project-modal">
      <NewProjectIcon />
      <p className={`${btnTextPrimary}`}>New Model</p>
    </button>
  );
};
