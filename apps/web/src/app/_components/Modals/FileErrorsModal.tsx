import React from 'react';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';

import {webTypes} from 'types';

import {useSetRecoilState} from 'recoil';
import {modalsAtom} from 'state';

import Button from 'app/_components/Button';
import {ObjectRenderer} from './ObjectRenderer';

export const FileErrorsModal = ({modalContent}: webTypes.FileErrorsModalProps) => {
  const setModals = useSetRecoilState(modalsAtom);
  const {name, desc, data} = modalContent;

  const closeModal = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        // don't proceed with upload
        draft.modals = [];
      })
    );
  };

  return (
    <div
      className={`bg-secondary-midnight text-white px-4 py-8 flex flex-col space-y-8 rounded-md max-h-[600px] overflow-auto`}
    >
      <div className="flex flex-col space-y-4">
        <p>
          <span>
            File Upload Warning: <strong>{name}</strong>
          </span>
        </p>
        <p>
          <span className="whitespace-wrap text-sm text-light-gray">{desc}</span>
        </p>
        <ObjectRenderer data={data} />
      </div>
      <div className="flex flex-col items-stretch">
        <Button className="text-white bg-red-600 hover:bg-red-500" onClick={closeModal}>
          <span>Exit</span>
        </Button>
      </div>
    </div>
  );
};
