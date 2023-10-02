import React, {useCallback, useState} from 'react';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';

import {webTypes} from 'types';
import {_getSignedUploadUrls, _ingestFiles, _uploadFile, api} from 'lib';

import {useRecoilState, useSetRecoilState} from 'recoil';
import {modalsAtom, projectAtom} from 'state';

import Button from 'app/_components/Button';
import {DecisionBtns} from './DecisionBtns';
import {CollisionType} from './CollisionType';
import {cleanNoOps} from 'lib/client/files/transforms/cleanNoOps';
import {renameAppend} from 'lib/client/files/transforms/renameAppend';
import {LoadingDots} from 'app/_components/Loaders/LoadingDots';

export const FileDecisionModal = ({modalContent}: webTypes.FileDecisionsModalProps) => {
  // @ts-ignore
  const [payload, setPayload] = useState<webTypes.IClientSidePayload>(modalContent.data.payload);
  const [project, _] = useRecoilState(projectAtom);
  const setModals = useSetRecoilState(modalsAtom);

  const {name, desc, data} = modalContent;

  // mutations
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

  // execute upload/glyph engine
  const upload = useCallback(async () => {
    // forced to filter out no-ops on the fly to allow non-desctructive state ops on toggle

    // @ts-ignore
    const {cleanPayload, cleanFiles} = cleanNoOps(payload, data.acceptedFiles);

    // @ts-ignore
    const finalPayload = renameAppend(cleanPayload, data.collisions);
    // get s3 keys for upload
    const keys = finalPayload.fileStats.map((stat) => `${stat.tableName}/${stat.fileName}`);

    const {signedUrls} = await api({
      ..._getSignedUploadUrls(project.workspace.id, project.id, keys),
      returnData: true,
    });

    await Promise.all(
      signedUrls.map(async (url, idx) => {
        // upload raw file data to s3
        await api({
          ..._uploadFile(await cleanFiles[idx].arrayBuffer(), url),
          upload: true,
        });
      })
    );

    // only call ingest once
    if (finalPayload.fileInfo.length > 0) {
      await api({
        ..._ingestFiles(finalPayload),
        onSuccess: () => {
          closeModal();
        },
      });
    } else {
      closeModal();
    }
  }, [closeModal, data, payload, project]);

  return (
    <div
      className={`bg-secondary-midnight text-white px-4 py-8 flex flex-col space-y-8 rounded-md max-h-[600px] max-w-3xl overflow-auto`}
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
        <div className="grid grid-cols-12 gap-2">
          <div className="col-span-2 rounded-md px-2">
            <div className="font-bold my-2 text-xs">Duplicates:</div>
          </div>
          <div className="col-span-3 rounded-md px-2">
            <div className="font-bold my-2 text-xs">New File:</div>
          </div>
          <div className="col-span-3 rounded-md px-2">
            <div className="font-bold my-2 text-xs">Existing File:</div>
          </div>
          <div className="col-span-4 rounded-md px-2">
            <div className="font-bold my-2 text-xs">Operation:</div>
          </div>
        </div>
        {/* @ts-ignore */}
        {data.collisions.map(({newFile, existingFile, type, operations}, idx) => (
          <div className="grid grid-cols-12 gap-2" key={`${idx}-${type}`}>
            <div className="col-span-2 rounded-md p-2 text-xs">
              <div className="truncate max-w-20">
                <CollisionType type={type as webTypes.constants.COLLISION_CASE} />
              </div>
            </div>
            <div className="col-span-3 rounded-md p-2 text-xs">
              <div className="truncate max-w-20">{newFile}</div>
            </div>
            <div className="col-span-3 rounded-md p-2 text-xs">
              <div className="truncate max-w-20">{existingFile}</div>
            </div>
            <div className="col-span-4 rounded-md p-2 text-xs">
              <div className="flex items-center">{DecisionBtns(operations, idx, handleOp, payload)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-stretch">
        <Button className="bg-yellow hover:bg-primary-yellow" onClick={upload}>
          {modalContent.isSubmitting ? <LoadingDots /> : <span>Confirm</span>}
        </Button>
      </div>
    </div>
  );
};
