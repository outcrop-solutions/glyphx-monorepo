import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { web as webTypes } from '@glyphx/types';
import { useSWRConfig } from 'swr';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { DocumentDuplicateIcon } from '@heroicons/react/outline';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { _deleteWorkspace, api } from 'lib';
import Button from 'app/_components/Button';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { modalsAtom, workspaceAtom } from 'state';
import { LoadingDots } from 'app/_components/Loaders/LoadingDots';

export const DeleteWorkspaceModal = ({ modalContent }: webTypes.DeleteWorkspaceModalProps) => {
  const { mutate } = useSWRConfig();
  const router = useRouter();
  const { workspaceSlug } = router.query;
  const setModals = useSetRecoilState(modalsAtom);
  const setWorkspace = useSetRecoilState(workspaceAtom);

  const [verifyWorkspace, setVerifyWorkspace] = useState('');
  const verifiedWorkspace = verifyWorkspace === workspaceSlug;
  const copyToClipboard = () => toast.success('Copied to clipboard!');

  // local state
  const handleVerifyWorkspaceChange = (event) => setVerifyWorkspace(event.target.value);

  // mutations
  const deleteWorkspace = () => {
    if (!Array.isArray(workspaceSlug))
      api({
        ..._deleteWorkspace(workspaceSlug),
        setLoading: (state) =>
          setModals(
            produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
              draft.modals[0].isSubmitting = state;
            })
          ),
        onSuccess: () => {
          setModals(
            produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
              draft.modals.splice(0, 1);
            })
          );
          setWorkspace(null);
          router.replace('/account');
        },
      });
  };

  return (
    <div className="bg-secondary-midnight text-white px-4 py-8 flex flex-col space-y-8 rounded-md">
      <p className="flex flex-col">
        <span>Your workspace will be deleted, along with all of its contents.</span>
        <span>Data associated with this workspace can&apos;t be accessed by team members.</span>
      </p>
      <p className="px-3 py-2 text-red-600 border border-red-600 rounded">
        <strong>Warning:</strong> This action is not reversible. Please be certain.
      </p>
      <div className="flex flex-col">
        <span>Enter your workspace slug to continue:</span>
        <div className="flex items-center justify-between px-3 py-2 space-x-5 font-mono text-sm border rounded my-4">
          <strong>
            <span className="overflow-x-auto">{workspaceSlug}</span>
          </strong>
          <CopyToClipboard onCopy={copyToClipboard} text={workspaceSlug}>
            <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
          </CopyToClipboard>
        </div>
        <input
          className="px-3 py-2 border rounded bg-transparent"
          disabled={modalContent.isSubmitting}
          onChange={handleVerifyWorkspaceChange}
          type="text"
          value={verifyWorkspace}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button
          className="text-white bg-red-600 hover:bg-red-500"
          disabled={!verifiedWorkspace || modalContent.isSubmitting}
          onClick={deleteWorkspace}
        >
          {modalContent.isSubmitting ? <LoadingDots /> : <span>Delete Workspace</span>}
        </Button>
      </div>
    </div>
  );
};