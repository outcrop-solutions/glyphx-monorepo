import React, { useState } from 'react';
import produce from 'immer';

import { _deleteProject, _deleteWorkspace } from 'lib';
import Button from 'components/Button';
import { useRecoilState } from 'recoil';
import { showModalAtom } from 'state';
import { web as webTypes } from '@glyphx/types';
import { ObjectRenderer } from './ObjectRenderer';

export const FileErrorsModal = () => {
  const [errModal, setErrModal] = useRecoilState(showModalAtom);
  const { data, type } = errModal;
  const [toggle, setToggle] = useState();

  const closeModal = () => {
    setErrModal(
      produce((draft) => {
        draft.type = false;
        draft.data = {};
      })
    );
  };

  return (
    <div
      className={`bg-secondary-midnight text-white px-4 py-8 flex flex-col space-y-8 rounded-md max-h-[600px] overflow-auto`}
    >
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
          {err.type === 'fileDecisions' ? (
            err.data.map(({ newFile, existingFile }, idx) => (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded-md shadow-md p-4">
                  <div className="font-bold mb-2">New File:</div>
                  <div>{newFile}</div>
                </div>
                <div className="bg-white rounded-md shadow-md p-4">
                  <div className="font-bold mb-2">Existing File:</div>
                  <div>{existingFile}</div>
                  <div className="mt-4 flex justify-between">
                    <div>ADD</div>
                    <div
                      className={`bg-gray-300 rounded-full h-6 w-12 flex items-center cursor-pointer transition-colors ${
                        true ? 'justify-end' : 'justify-start'
                      }`}
                      onClick={toggle}
                    >
                      <div
                        className={`rounded-full bg-white h-4 w-4 transition-transform transform ${
                          true ? 'translate-x-6' : ''
                        }`}
                      ></div>
                    </div>
                    <div>APPEND</div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <ObjectRenderer data={err.data} />
          )}
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
