'use client';
import React from 'react';
import Button from 'app/_components/Button';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';
import produce from 'immer';
import {useSetRecoilState} from 'recoil';
import {modalsAtom} from 'state';

export const TemplatePreviewBtn = ({template}) => {
  const setModals = useSetRecoilState(modalsAtom);
  return (
    <Button
      className=""
      onClick={() =>
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals.push({
              type: webTypes.constants.MODAL_CONTENT_TYPE.TEMPLATE_PREVIEW,
              isSubmitting: false,
              data: template,
            });
          })
        )
      }
    >
      <span>View</span>
    </Button>
  );
};
