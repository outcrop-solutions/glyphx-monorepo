import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { LightBulbIcon } from '@heroicons/react/outline';
import { webTypes } from 'types';
import { completionAtom } from 'state/ai';
import { _createCompletion } from 'lib/client/mutations/ai';
import { WritableDraft } from 'immer/dist/internal';
import { modalsAtom, projectAtom } from 'state';
import produce from 'immer';

const btnPrimary =
  'h-8 p-1 flex items-center justify-center bg-gray border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const AIButton = () => {
  const setModals = useSetRecoilState(modalsAtom);
  const project = useRecoilValue(projectAtom);

  const showRecs = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.push({
          type: webTypes.constants.MODAL_CONTENT_TYPE.AI_RECOMMENDATIONS,
          isSubmitting: false,
          data: project,
        });
      })
    );
  };

  return (
    <button className={`${btnPrimary}`} onClick={() => showRecs()} aria-controls="share-control">
      <LightBulbIcon className="w-4 h-4" />
    </button>
  );
};
