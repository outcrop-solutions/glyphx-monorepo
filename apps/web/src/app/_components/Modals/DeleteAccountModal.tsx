import React, { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { webTypes } from 'types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import toast from 'react-hot-toast';
import { DocumentDuplicateIcon } from '@heroicons/react/outline';
import Button from 'app/_components/Button';

import { _deactivateAccount, _deleteWorkspace, api } from 'lib';
import { useUrl } from 'lib/client/hooks';

import { useSetRecoilState } from 'recoil';
import { modalsAtom } from 'state';
import { LoadingDots } from 'app/_components/Loaders/LoadingDots';

export const DeleteAccountModal = ({ modalContent }: webTypes.DeleteAccountModalProps) => {
  const { data } = useSession();
  const url = useUrl();
  const setModals = useSetRecoilState(modalsAtom);
  const [verifyEmail, setVerifyEmail] = useState('');

  const copyToClipboard = () => toast.success('Copied to clipboard!');

  const verifiedEmail = verifyEmail === data?.user.email;

  const handleVerifyEmailChange = (event) => setVerifyEmail(event.target.value);

  const deactivateAccount = (event) => {
    event.preventDefault();
    api({
      ..._deactivateAccount(),
      setLoading: (state) =>
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals[0].isSubmitting = state as boolean;
          })
        ),
      onSuccess: () => {
        setModals(
          produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
            draft.modals.splice(0, 1);
          })
        );
        signOut({ callbackUrl: `${url}/auth/login` });
      },
    });
  };

  return (
    <div className="bg-secondary-midnight text-white px-4 py-8 flex flex-col space-y-8 rounded-md">
      <p>Your account will be deleted, along with all of its Workspace contents.</p>
      <p className="px-3 py-2 text-red-600 border border-red-600 rounded">
        <strong>Warning:</strong> This action is not reversible. Please be certain.
      </p>
      <div className="flex flex-col">
        <span>Enter your email to continue:</span>
        <div className="flex items-center justify-between px-3 py-2 space-x-5 font-mono text-sm border rounded my-4">
          <strong>
            <span className="overflow-x-auto">{data?.user.email}</span>
          </strong>
          <CopyToClipboard onCopy={copyToClipboard} text={data?.user.email}>
            <DocumentDuplicateIcon className="w-5 h-5 cursor-pointer hover:text-blue-600" />
          </CopyToClipboard>
        </div>
        <input
          className="px-3 py-2 border rounded bg-transparent"
          disabled={modalContent.isSubmitting}
          onChange={handleVerifyEmailChange}
          type="email"
          value={verifyEmail}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button
          className="text-white bg-red-600 hover:bg-red-500"
          disabled={!verifiedEmail || modalContent.isSubmitting}
          onClick={deactivateAccount}
        >
          {modalContent.isSubmitting ? <LoadingDots /> : <span>Delete Personal Account</span>}
        </Button>
      </div>
    </div>
  );
};
