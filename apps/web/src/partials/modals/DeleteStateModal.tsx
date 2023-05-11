import React, { useState } from 'react';
import Button from 'components/Button';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { _createState, api } from 'lib';
import { web as webTypes } from '@glyphx/types';
import { useSetRecoilState } from 'recoil';
import { modalsAtom, projectAtom } from 'state';
import toast from 'react-hot-toast';
import { _deleteState } from 'lib';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { DocumentDuplicateIcon } from '@heroicons/react/outline';
import { LoadingDots } from 'partials/loaders/LoadingDots';

export const DeleteStateModal = ({ modalContent }: webTypes.DeleteStateModalProps) => {
  const setModals = useSetRecoilState(modalsAtom);
  const setProject = useSetRecoilState(projectAtom);
  const [name, setName] = useState('');
  const validName = name === modalContent.data.name;

  const copyToClipboard = () => toast.success('Copied to clipboard!');
  // local state
  const handleNameChange = (event) => setName(event.target.value);

  // mutations
  const deleteState = (event) => {
    event.preventDefault();
    api({
      ..._deleteState(modalContent.data.id),
      setLoading: (state) =>
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals[0].isSubmitting = state;
          })
        ),
      onError: (_: any) => {
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals.splice(0, 1);
          })
        );
      },
      onSuccess: (data: any) => {
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals.splice(0, 1);
          })
        );
        setProject(
          produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
            draft.stateHistory.filter((state) => state._id !== modalContent.data.id);
          })
        );
      },
    });
  };

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
          onClick={deleteState}
        >
          {modalContent.isSubmitting ? <LoadingDots /> : <span>Delete State</span>}
        </Button>
      </div>
    </div>
  );
};
