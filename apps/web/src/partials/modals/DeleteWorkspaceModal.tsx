import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { web as webTypes } from '@glyphx/types';

import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { _deleteWorkspace, api } from 'lib';
import Button from 'components/Button';

import { useRecoilState, useSetRecoilState } from 'recoil';
import { modalsAtom, workspaceAtom } from 'state';

export const DeleteWorkspaceModal = ({ modalContent }: webTypes.DeleteWorkspaceModalProps) => {
  const router = useRouter();
  const setModals = useSetRecoilState(modalsAtom);
  const [workspace, setWorkspace] = useRecoilState(workspaceAtom);

  const [verifyWorkspace, setVerifyWorkspace] = useState('');
  const verifiedWorkspace = verifyWorkspace === workspace?.slug;

  // local state
  const handleVerifyWorkspaceChange = (event) => setVerifyWorkspace(event.target.value);

  // mutations
  const deleteWorkspace = () => {
    api({
      ..._deleteWorkspace(workspace.slug),
      setLoading: (state) =>
        setModals(
          produce((draft: WritableDraft<webTypes.ModalsAtom>) => {
            draft[0].isSubmitting = state;
          })
        ),
      onSuccess: () => {
        setModals(
          produce((draft: WritableDraft<webTypes.ModalsAtom>) => {
            draft.modals.slice(0, 1);
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
        <label className="text-sm text-gray-400">
          Enter <strong>{workspace?.slug}</strong> to continue:
        </label>
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
          <span>Delete Workspace</span>
        </Button>
      </div>
    </div>
  );
};
