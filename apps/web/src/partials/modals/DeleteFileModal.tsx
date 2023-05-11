import React, { useCallback, useState } from 'react';
import produce from 'immer';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { web as webTypes, database as databaseTypes } from '@glyphx/types';
import toast from 'react-hot-toast';

import Button from 'components/Button';
import { DocumentDuplicateIcon } from '@heroicons/react/outline';

import { _ingestFiles, api } from 'lib';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { modalsAtom, projectAtom } from 'state';
import { parseDeletePayload } from 'lib/client/files/transforms/parseDeletePayload';
import { WritableDraft } from 'immer/dist/internal';
import { LoadingDots } from 'partials/loaders/LoadingDots';

export const DeleteFileModal = ({ modalContent }: webTypes.DeleteFileModalProps) => {
  const [project, setProject] = useRecoilState(projectAtom);
  const setModals = useSetRecoilState(modalsAtom);

  const [verifyFile, setVerifyFile] = useState('');
  const verifiedFile = verifyFile === modalContent.data.fileName;

  const copyToClipboard = () => toast.success('Copied to clipboard!');
  // local state
  const handleVerifyProjectChange = (event) => setVerifyFile(event.target.value);

  const deleteFile = useCallback(() => {
    const payload = parseDeletePayload(project.workspace._id, project._id, project.files, modalContent.data.fileName);

    api({
      ..._ingestFiles(payload),
      setLoading: (state) =>
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals[0].isSubmitting = state;
          })
        ),
      onSuccess: (data) => {
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals.splice(0, 1);
          })
        );
        // update project filesystem
        setProject(
          produce((draft: WritableDraft<databaseTypes.IProject>) => {
            draft.files = project.files.filter((file) => file.fileName !== modalContent.data.fileName);
          })
        );
      },
    });
  }, [modalContent.data.fileName, project, setModals, setProject]);

  return (
    <div className="bg-secondary-midnight text-white px-4 py-8 flex flex-col space-y-8 rounded-md">
      <p className="flex flex-col">
        <span>Your file will be deleted, along with all of its contents.</span>
        <span>Data associated with this file can&apos;t be accessed by team members.</span>
        <span>Any state snapshot that relies on this data will be invalidated.</span>
      </p>
      <p className="px-3 py-2 text-red-600 border border-red-600 rounded">
        <strong>Warning:</strong> This action is not reversible. Please be certain.
      </p>
      <div className="flex flex-col">
        <span>Enter your filename to continue:</span>
        <div className="flex items-center justify-between px-3 py-2 space-x-5 font-mono text-sm border rounded my-4">
          <strong>
            <span className="overflow-x-auto">{modalContent.data.fileName}</span>
          </strong>
          <CopyToClipboard onCopy={copyToClipboard} text={modalContent.data.fileName}>
            <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
          </CopyToClipboard>
        </div>
        <input
          className="px-3 py-2 border rounded bg-transparent"
          disabled={modalContent.isSubmitting}
          onChange={handleVerifyProjectChange}
          type="text"
          value={verifyFile}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button
          className="text-white bg-red-600 hover:bg-red-500"
          disabled={!verifiedFile || modalContent.isSubmitting}
          onClick={deleteFile}
        >
          {modalContent.isSubmitting ? <LoadingDots /> : <span>Delete File</span>}
        </Button>
      </div>
    </div>
  );
};
