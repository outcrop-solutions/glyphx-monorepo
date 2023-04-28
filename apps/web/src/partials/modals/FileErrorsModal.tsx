import React from 'react';
import produce from 'immer';

import { _deleteProject, _deleteWorkspace } from 'lib';
import Button from 'components/Button';
import { useRecoilState } from 'recoil';
import { showModalAtom } from 'state';
import { web as webTypes } from '@glyphx/types';
import { ObjectRenderer } from './ObjectRenderer';

export const FileErrorsModal = () => {
  const [errModal, setErrModal] = useRecoilState(showModalAtom);
  const { data } = errModal;
  console.log({ data });

  const closeModal = () => {
    setErrModal(
      produce((draft) => {
        draft.type = false;
        draft.data = {};
      })
    );
  };

  return (
    <div className="bg-secondary-midnight text-white px-4 py-8 flex flex-col space-y-8 rounded-md max-w-lg">
      {(data.fileErrors as unknown as webTypes.IFileRule[]).map((err, idx) => (
        <div className="flex flex-col space-y-4" key={`${idx}-${err.name}`}>
          <p>
            <span>
              File Upload Warning: <strong>{err.name}</strong>
            </span>
          </p>
          <p>
            <span className="whitespace-wrap text-sm text-light-gray">{err.desc}</span>
          </p>
          <ObjectRenderer data={err.data} />
        </div>
      ))}
      <div className="flex flex-col items-stretch">
        <Button className="text-white bg-red-600 hover:bg-red-500" onClick={closeModal}>
          <span>Exit</span>
        </Button>
      </div>
    </div>
  );
};
