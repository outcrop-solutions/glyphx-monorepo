import Button from 'components/Button';
import produce from 'immer';
import { _deleteProject, _deleteWorkspace, api } from 'lib';
import React, { useState } from 'react';
import { useRecoilState } from 'recoil';
import { showModalAtom } from 'state';

export const DeleteProjectModal = () => {
  const [deleteModal, setDeleteModal] = useRecoilState(showModalAtom);

  const [verifyProject, setVerifyProject] = useState('');
  const verifiedProject = verifyProject === deleteModal?.data.projectName;

  // local state
  const handleVerifyProjectChange = (event) => setVerifyProject(event.target.value);

  // mutations
  const deleteProject = () => {
    api({
      ..._deleteProject(deleteModal?.data.projectId as string),
      setLoading: (state) =>
        setDeleteModal(
          produce((draft) => {
            draft.isSubmitting = state;
          })
        ),
      onSuccess: () => {
        setDeleteModal(
          produce((draft) => {
            draft.type = false;
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
          Enter <strong>{deleteModal?.data?.projectName}</strong> to continue:
        </label>
        <input
          className="px-3 py-2 border rounded bg-transparent"
          disabled={deleteModal.isSubmitting}
          onChange={handleVerifyProjectChange}
          type="text"
          value={verifyProject}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button
          className="text-white bg-red-600 hover:bg-red-500"
          disabled={!verifiedProject || deleteModal.isSubmitting}
          onClick={deleteProject}
        >
          <span>Delete Project</span>
        </Button>
      </div>
    </div>
  );
};
