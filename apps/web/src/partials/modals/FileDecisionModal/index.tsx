import React, { useCallback, useEffect, useState } from 'react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { _deleteProject, _deleteWorkspace, _ingestFiles, _uploadFile, api } from 'lib';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { modalsAtom, projectAtom } from 'state';

import Button from 'components/Button';
import { useFileSystem } from 'services';
import { DecisionBtns } from './DecisionBtns';

export const FileDecisionModal = ({ modalContent }: webTypes.FileDecisionsModalProps) => {
  const [payload, setPayload] = useState<webTypes.IClientSidePayload>(modalContent.data.payload);
  const [acceptedFiles, setAcceptedFiles] = useState(modalContent.data.acceptedFiles);
  const [project, setProject] = useRecoilState(projectAtom);
  const setModals = useSetRecoilState(modalsAtom);
  const { selectFile } = useFileSystem();
  const { name, desc, data } = modalContent;

  const closeModal = useCallback(() => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.splice(0, 1);
      })
    );
  }, [setModals]);

  const handleOp = useCallback((idx: number, op: number) => {
    setPayload(
      produce((draft: WritableDraft<webTypes.IClientSidePayload>) => {
        draft.fileInfo[idx].operation = op;
      })
    );
  }, []);

  useEffect(() => {
    console.log({ payload });
  }, [payload]);

  // execute upload/glyph engine
  const upload = useCallback(async () => {
    // forced to filter out no-ops on the fly to allow non-desctructive state ops on toggle
    const cleanFileInfo = payload.fileInfo.filter((info) => info.operation !== -1);
    const cleanList = cleanFileInfo.map((i) => i.fileName);

    // Generate an array of indexes to keep
    const indexesToKeep = payload.fileStats.reduce((acc, stat, index) => {
      if (cleanList.includes(stat.fileName)) {
        acc.push(index);
      }
      return acc;
    }, []);

    // Filter out fileStats using the array of indexes
    const cleanFileStats = payload.fileStats.filter((_, idx) => indexesToKeep.includes(idx));

    const cleanPayload = {
      ...payload,
      fileInfo: cleanFileInfo,
      fileStats: cleanFileStats,
    };

    // Filter our no=op buffers using array of indexes
    const cleanFiles = data.acceptedFiles.filter((_, idx) => indexesToKeep.includes(idx));

    // get s3 keys for upload
    const keys = cleanPayload.fileStats.map((stat) => `${stat.tableName}/${stat.fileName}`);
    await Promise.all(
      keys.map(async (key, idx) => {
        // upload raw file data to s3
        await api({
          ..._uploadFile(
            await cleanFiles[idx].arrayBuffer(),
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
      ..._ingestFiles(payload),
      onSuccess: (data) => {
        // update project filesystem
        setProject(
          produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
            draft.files = data.payload.fileStats;
            draft.files[0].dataGrid = data.dataGrid;
            draft.files[0].open = true;
          })
        );
        // open first file
        selectFile(0);
      },
    });

    closeModal();
  }, [closeModal, data, payload, project, selectFile, setProject]);

  return (
    <div
      className={`bg-secondary-midnight text-white px-4 py-8 flex flex-col space-y-8 rounded-md max-h-[600px] max-w-xl overflow-auto`}
    >
      <div className="flex flex-col space-y-4">
        <p>
          <span>
            <strong>{name}</strong>
          </span>
        </p>
        <p>
          <span className="whitespace-wrap text-sm text-light-gray">{desc}</span>
        </p>
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-md px-2">
            <div className="font-bold my-2 text-xs">Duplicates:</div>
          </div>
          <div className="rounded-md px-2">
            <div className="font-bold my-2 text-xs">New File:</div>
          </div>
          <div className="rounded-md px-2">
            <div className="font-bold my-2 text-xs">Existing File:</div>
          </div>
          <div className="rounded-md px-2">
            <div className="font-bold my-2 text-xs">Operation:</div>
          </div>
        </div>
        {data.collisions.map(({ newFile, existingFile, type, operations }, idx) => (
          <div className="grid grid-cols-4 gap-2" key={`${idx}-${type}`}>
            <div className="rounded-md p-2 text-xs">
              <div className="truncate max-w-20">{type}</div>
            </div>
            <div className="rounded-md p-2 text-xs">
              <div className="truncate max-w-20">{newFile}</div>
            </div>
            <div className="rounded-md p-2 text-xs">
              <div className="truncate max-w-20">{existingFile}</div>
            </div>
            <div className="rounded-md p-2 text-xs mx-8">
              <div className="flex items-center justify-around">{DecisionBtns(operations, idx, handleOp, payload)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-stretch">
        <Button className="bg-yellow hover:bg-primary-yellow" onClick={upload}>
          <span>Confirm</span>
        </Button>
      </div>
    </div>
  );
};
