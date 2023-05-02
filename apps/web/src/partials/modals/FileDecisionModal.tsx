import React, { useCallback, useState } from 'react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { _deleteProject, _deleteWorkspace, _ingestFiles, _uploadFile, api } from 'lib';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { modalsAtom, projectAtom } from 'state';

import Button from 'components/Button';
import { useFileSystem } from 'services';

export const FileDecisionModal = ({ modalContent }: webTypes.FileDecisionsModalProps) => {
  const [payload, setPayload] = useState([]);
  const [project, setProject] = useRecoilState(projectAtom);
  const setModals = useSetRecoilState(modalsAtom);
  const { selectFile } = useFileSystem();
  const { name, desc, data } = modalContent;

  const closeModal = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.splice(0, 1);
      })
    );
  };

  const Btn = ({ children, className, ...rest }) => {
    return (
      <button
        className={`flex items-center bg-primary-yellow text-secondary-space-blue justify-around px-2 mx-2 py-1 rounded disabled:opacity-75 text-xs ${className}`}
        {...rest}
      >
        {children}
      </button>
    );
  };

  const DecisionBtns = (ops: (fileIngestionTypes.constants.FILE_OPERATION | -1)[], idx: number) => {
    return (
      <>
        {ops.map((op) => (
          <>
            {(() => {
              switch (op) {
                case -1:
                  return <Btn className="">CANCEL</Btn>;
                case 1:
                  return <Btn className="">APPEND</Btn>;
                case 2:
                  return <Btn className="">ADD</Btn>;
                case 3:
                  return <Btn className="">REPLACE</Btn>;
                default:
                  return <></>;
              }
            })()}
          </>
        ))}
      </>
    );
  };

  const decide = useCallback((idx: number) => {}, []);

  // execute upload/glyph engine
  const upload = useCallback(async () => {
    // get s3 keys for upload
    const keys = data.payload.fileStats.map((stat) => `${stat.tableName}/${stat.fileName}`);
    await Promise.all(
      keys.map(async (key, idx) => {
        // upload raw file data to s3
        await api({
          ..._uploadFile(
            await data.acceptedFiles[idx].arrayBuffer(),
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
  }, [data, payload, project, selectFile, setProject]);

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
        {data.map(({ newFile, existingFile, type, operations }, idx) => (
          <div className="grid grid-cols-4 gap-2">
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
              <div className="flex items-center justify-around">{DecisionBtns(operations, idx)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-stretch">
        <Button className="text-white bg-yellow hover:bg-primary-yellow" onClick={upload}>
          <span>Confirm</span>
        </Button>
      </div>
    </div>
  );
};
