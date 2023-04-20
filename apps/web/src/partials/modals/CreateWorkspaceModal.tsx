import Button from 'components/Button';
import produce from 'immer';
import { _createWorkspace, api, useWorkspace, useWorkspaces } from 'lib';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { showModalAtom } from 'state';

export const CreateWorkspaceModal = () => {
  const router = useRouter();
  const [createModal, setCreateModal] = useRecoilState(showModalAtom);
  const [name, setName] = useState('');
  const validName = name.length > 0 && name.length <= 16;

  // local state
  const handleNameChange = (event) => setName(event.target.value);

  // mutations
  const createWorkspace = (event) => {
    event.preventDefault();
    api({
      ..._createWorkspace(name),
      setLoading: (state) =>
        setCreateModal(
          produce((draft) => {
            draft.isSubmitting = state;
          })
        ),
      onSuccess: (result) => {
        setCreateModal(
          produce((draft) => {
            draft.type = false;
          })
        );
        router.replace(`/account/${result.slug}`);
      },
    });
  };

  return (
    <div className="flex flex-col items-stretch justify-center px-4 py-8 space-y-5 bg-secondary-midnight rounded-md text-white">
      <div className="space-y-0 text-sm text-gray-600">
        <p>Create a workspace to keep your team&apos;s content in one place.</p>
        <p>You&apos;ll be able to invite everyone later!</p>
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold">Workspace Name</h3>
        <p className="text-sm text-gray-400">Name your workspace. Keep it simple.</p>
        <input
          className="w-full px-3 py-2 border rounded bg-transparent"
          disabled={createModal.isSubmitting}
          onChange={handleNameChange}
          type="text"
          value={name}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button className="" disabled={!validName || createModal.isSubmitting} onClick={createWorkspace}>
          <span>Create Workspace</span>
        </Button>
      </div>
    </div>
  );
};
