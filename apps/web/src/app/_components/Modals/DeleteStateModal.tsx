'use client';
import React, {startTransition, useState} from 'react';
import Button from 'app/_components/Button';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';
import {useSetRecoilState} from 'recoil';
import {modalsAtom} from 'state';
import toast from 'react-hot-toast';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {DocumentDuplicateIcon} from '@heroicons/react/outline';
import {LoadingDots} from 'app/_components/Loaders/LoadingDots';
import {deleteState} from 'business/src/actions';

export const DeleteStateModal = ({modalContent}: webTypes.DeleteStateModalProps) => {
  const setModals = useSetRecoilState(modalsAtom);
  const [name, setName] = useState('');
  const validName = name === modalContent.data.name;

  const copyToClipboard = () => toast.success('Copied to clipboard!');
  // local state
  const handleNameChange = (event) => setName(event.target.value);

  return (
    <div className="bg-secondary-midnight text-white px-4 py-8 flex flex-col space-y-8 rounded-md">
      <p className="flex flex-col">
        <span>Your State will be deleted, along with all of its contents.</span>
        <span>Data associated with this snapshot can&apos;t be accessed by team members.</span>
        <span>Any state snapshot that relies on this data will be invalidated.</span>
      </p>
      <p className="px-3 py-2 text-red-600 border border-red-600 rounded">
        <strong>Warning:</strong> This action is not reversible. Please be certain.
      </p>
      <div className="flex flex-col">
        <span>Enter your State name to continue:</span>
        <div className="flex items-center justify-between px-3 py-2 space-x-5 font-mono text-sm border rounded my-4">
          <strong>
            <span className="overflow-x-auto">{modalContent.data.name}</span>
          </strong>
          <CopyToClipboard onCopy={copyToClipboard} text={modalContent.data.name}>
            <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
          </CopyToClipboard>
        </div>
        <input
          className="px-3 py-2 border rounded bg-transparent"
          disabled={modalContent.isSubmitting}
          onChange={handleNameChange}
          type="text"
          value={name}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button
          className="text-white bg-red-600 hover:bg-red-500"
          disabled={!validName || modalContent.isSubmitting}
          onClick={() =>
            startTransition(() => {
              deleteState(modalContent.data.id.toString());
              setModals(
                produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
                  draft.modals.splice(0, 1);
                })
              );
            })
          }
        >
          {modalContent.isSubmitting ? <LoadingDots /> : <span>Delete State</span>}
        </Button>
      </div>
    </div>
  );
};
