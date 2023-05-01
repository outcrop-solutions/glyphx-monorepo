import React, { useCallback, useState } from 'react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { web as webTypes } from '@glyphx/types';
import { _deleteProject, _deleteWorkspace, _ingestFiles, _uploadFile, api } from 'lib';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { modalsAtom, projectAtom } from 'state';

import Button from 'components/Button';
import { ObjectRenderer } from './ObjectRenderer';

export const FileErrorsModal = ({ modalContent }: webTypes.FileErrorsModalProps) => {
  const [project, setProject] = useRecoilState(projectAtom);
  const setModals = useSetRecoilState(modalsAtom);
  const [toggle, setToggle] = useState();

  const closeModal = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.ModalState>) => {
        draft.type = webTypes.constants.MODAL_CONTENT_TYPE.CLOSED;
        draft.data = false;
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
      {(modalContent.data.fileErrors as unknown as webTypes.IFileRule[]).map((err, idx) => (
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
