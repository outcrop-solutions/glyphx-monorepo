import Button from 'components/Button';
import produce from 'immer';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { _ingestFiles, api } from 'lib';
import { parseDeletePayload } from 'lib/client/files/transforms';
import React, { useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';
import { projectAtom, showModalAtom } from 'state';
import { DocumentDuplicateIcon } from '@heroicons/react/outline';

export const DeleteFileModal = () => {
  const [project, setProject] = useRecoilState(projectAtom);
  const [deleteModal, setDeleteModal] = useRecoilState(showModalAtom);

  const [verifyFile, setVerifyFile] = useState('');
  const verifiedProject = verifyFile === deleteModal?.data.fileName;

  const copyToClipboard = () => toast.success('Copied to clipboard!');
  // local state
  const handleVerifyProjectChange = (event) => setVerifyFile(event.target.value);

  const deleteFile = useCallback(() => {
    const payload = parseDeletePayload(
      project.workspace._id,
      project._id,
      project.files,
      deleteModal.data.fileName as string
    );

    api({
      ..._ingestFiles(payload),
      setLoading: (state) =>
        setDeleteModal(
          produce((draft) => {
            draft.isSubmitting = state;
          })
        ),
      onSuccess: (data) => {
        setDeleteModal(
          produce((draft) => {
            draft.type = false;
          })
        );
        // update project filesystem
        setProject(
          produce((draft) => {
            // @ts-ignore
            draft.files = project.files.filter((file) => file.fileName !== fileName);
          })
        );
      },
    });
  }, [deleteModal.data.fileName, project._id, project.files, project.workspace._id, setDeleteModal, setProject]);

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
            <span className="overflow-x-auto">{deleteModal.data.fileName}</span>
          </strong>
          <CopyToClipboard onCopy={copyToClipboard} text={deleteModal.data.fileName}>
            <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
          </CopyToClipboard>
        </div>
        <input
          className="px-3 py-2 border rounded bg-transparent"
          disabled={deleteModal.isSubmitting}
          onChange={handleVerifyProjectChange}
          type="text"
          value={verifyFile}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button
          className="text-white bg-red-600 hover:bg-red-500"
          disabled={!verifiedProject || deleteModal.isSubmitting}
          onClick={deleteFile}
        >
          <span>Delete File</span>
        </Button>
      </div>
    </div>
  );
};
