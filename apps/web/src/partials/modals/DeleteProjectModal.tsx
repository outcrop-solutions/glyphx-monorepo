import React, { useState } from 'react';
import Button from 'components/Button';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { web as webTypes } from '@glyphx/types';
import { _deleteProject, _deleteWorkspace, api } from 'lib';
import { useSetRecoilState } from 'recoil';
import { modalsAtom } from 'state';

export const DeleteProjectModal = ({ modalContent }) => {
  const setModals = useSetRecoilState(modalsAtom);

  const [verifyProject, setVerifyProject] = useState('');
  const verifiedProject = verifyProject === modalContent?.data.projectName;

  // local state
  const handleVerifyProjectChange = (event) => setVerifyProject(event.target.value);

  // mutations
  const deleteProject = () => {
    api({
      ..._deleteProject(modalContent?.data.projectId as string),
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
      },
    });
  };

  return (
    <div className="bg-secondary-midnight text-white px-4 py-8 flex flex-col space-y-8 rounded-md">
      <p className="flex flex-col">
        <span>Your project will be deleted, along with all of its contents.</span>
        <span>Data associated with this project can&apos;t be accessed by team members.</span>
      </p>
      <p className="px-3 py-2 text-red-600 border border-red-600 rounded">
        <strong>Warning:</strong> This action is not reversible. Please be certain.
      </p>
      <div className="flex flex-col">
        <label className="text-sm text-gray-400">
          Enter <strong>{modalContent?.data?.projectName}</strong> to continue:
        </label>
        <input
          className="px-3 py-2 border rounded bg-transparent"
          disabled={modalContent.isSubmitting}
          onChange={handleVerifyProjectChange}
          type="text"
          value={verifyProject}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button
          className="text-white bg-red-600 hover:bg-red-500"
          disabled={!verifiedProject || modalContent.isSubmitting}
          onClick={deleteProject}
        >
          <span>Delete Project</span>
        </Button>
      </div>
    </div>
  );
};
