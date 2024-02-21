'use client';
import React, {startTransition, useState} from 'react';
import Button from 'app/_components/Button';
import {webTypes} from 'types';
import {useRouter} from 'next/navigation';
import {useSetRecoilState} from 'recoil';
import {modalsAtom} from 'state';
import {LoadingDots} from 'app/_components/Loaders/LoadingDots';
import {createWorkspace} from 'business/src/actions';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';

export const CreateWorkspaceModal = ({modalContent}: webTypes.CreateWorkspaceModalProps) => {
  const router = useRouter();
  const setModals = useSetRecoilState(modalsAtom);
  const [name, setName] = useState('');
  const validName = name.length > 0 && name.length <= 16;

  // local state
  const handleNameChange = (event) => setName(event.target.value);
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
          disabled={modalContent.isSubmitting}
          onChange={handleNameChange}
          type="text"
          value={name}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button
          className=""
          disabled={!validName || modalContent.isSubmitting}
          onClick={() =>
            startTransition(() => {
              createWorkspace(name);
              setModals(
                produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
                  draft.modals.splice(0, 1);
                })
              );
            })
          }
        >
          {modalContent.isSubmitting ? <LoadingDots /> : <span>Create Workspace</span>}
        </Button>
      </div>
    </div>
  );
};
