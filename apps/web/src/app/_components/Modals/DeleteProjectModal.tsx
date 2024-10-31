'use client';
import React, {useState, useTransition} from 'react';
import Button from 'app/_components/Button';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import {DocumentDuplicateIcon} from '@heroicons/react/outline';
import {webTypes} from 'types';
import {useSetRecoilState} from 'recoil';
import {modalsAtom} from 'state';
import {LoadingDots} from 'app/_components/Loaders/LoadingDots';
import {deactivateProject} from 'actions';

export const DeleteProjectModal = ({modalContent}: webTypes.DeleteProjectModalProps) => {
  const setModals = useSetRecoilState(modalsAtom);
  const [isPending, startTransition] = useTransition();

  const [verifyProject, setVerifyProject] = useState('');
  const verifiedProject = verifyProject === modalContent?.data.projectName;

  const copyToClipboard = () => toast.success('Copied to clipboard!');

  // local state
  const handleVerifyProjectChange = (event) => setVerifyProject(event.target.value);

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
        <span>Enter your project name to continue to continue:</span>
        <div className="flex items-center justify-between px-3 py-2 space-x-5 font-mono text-sm border rounded my-4">
          <strong>
            <span className="overflow-x-auto">{modalContent?.data?.projectName}</span>
          </strong>
          <CopyToClipboard onCopy={copyToClipboard} text={modalContent?.data?.projectName}>
            <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
          </CopyToClipboard>
        </div>
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
          disabled={!verifiedProject || isPending}
          onClick={async () => {
            startTransition(async () => {
              await deactivateProject(modalContent?.data?.projectId);
              setModals(
                produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
                  draft.modals.splice(0, 1);
                })
              );
            });
          }}
        >
          {isPending ? <LoadingDots /> : <span>Delete Project</span>}
        </Button>
      </div>
    </div>
  );
};
