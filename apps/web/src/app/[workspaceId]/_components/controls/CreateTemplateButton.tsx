import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { web as webTypes } from '@glyphx/types';
import { modalsAtom, projectAtom } from 'state';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { PlusIcon } from '@heroicons/react/outline';

const btnTextPrimary = 'text-white font-roboto font-medium leading-[16px] pl-1';

const btnPrimary =
  'h-8 p-1 flex items-center justify-center bg-gray border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const CreateTemplateButton = () => {
  const setModals = useSetRecoilState(modalsAtom);
  const project = useRecoilValue(projectAtom);

  const showTemplateModal = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.CREATE_PROJECT_TEMPLATE,
          isSubmitting: false,
          data: project,
        });
      })
    );
  };

  return (
    <button className={`${btnPrimary}`} onClick={() => showTemplateModal()} aria-controls="share-control">
      <PlusIcon className="w-4 h-4" />
      <p className={`${btnTextPrimary}`}>Template</p>
    </button>
  );
};
