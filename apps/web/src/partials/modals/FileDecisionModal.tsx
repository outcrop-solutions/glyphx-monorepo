import React, { useCallback, useState } from 'react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { web as webTypes } from '@glyphx/types';
import { _deleteProject, _deleteWorkspace, _ingestFiles, _uploadFile, api } from 'lib';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { modalsAtom, projectAtom } from 'state';

import Button from 'components/Button';
import { useFileSystem } from 'services';


export const FileDecisionModal = ({ modalContent }:  webTypes.FileDecisionsModalProps ) => {
  const [project, setProject] = useRecoilState(projectAtom);
  const setModals = useSetRecoilState(modalsAtom)
  const {selectFile} = useFileSystem()

  const [toggle, setToggle] = useState();

  const closeModal = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.ModalsAtom>) => {
         draft.modals.slice(0, 1);
      })
    );
  };

  useCallback(async () => {
    // get s3 keys for upload
    const keys = modalContent.data.payload.fileStats.map((stat) => `${stat.tableName}/${stat.fileName}`);
    // get signed urls
    // api({
    // ..._getSignedUploadUrls(workspace._id.toString(), project._id.toString(), keys),
    // onSuccess: ({ signedUrls }) => {
    await Promise.all(
      keys.map(async (key, idx) => {
        // upload raw file data to s3
        await api({
          ..._uploadFile(
            await modalContent.data.acceptedFiles[idx].arrayBuffer(),
            key,
            project.workspace._id.toString(),
            project._id.toString()
          ),
          upload: true,
        });
      })
    );

    // only call ingest once
    await api({
      ..._ingestFiles(modalContent.data.payload),
      onSuccess: (data) => {
        // update project filesystem
        setProject(
          produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
            draft.files = modalContent.data.payload.fileStats;
            draft.files[0].dataGrid = modalContent.data.dataGrid;
            draft.files[0].open = true;
          })
        );
        // open first file
        selectFile(0);
      },
    });
  }, [modalContent.data.acceptedFiles, modalContent.data.payload, project._id, project.workspace._id, setProject]);

  return (
    <div
      className={`bg-secondary-midnight text-white px-4 py-8 flex flex-col space-y-8 rounded-md max-h-[600px] overflow-auto`}
    >
      {(modalContent.data.fileErrors).map((err, idx) => (
        <div className="flex flex-col space-y-4" key={`${idx}-${err.name}`}>
          <p>
            <span>
              File Upload Warning: <strong>{err.name}</strong>
            </span>
          </p>
          <p>
            <span className="whitespace-wrap text-sm text-light-gray">{err.desc}</span>
          </p>
            err.modalContent.data.map(({ newFile, existingFile }, idx) => (
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
