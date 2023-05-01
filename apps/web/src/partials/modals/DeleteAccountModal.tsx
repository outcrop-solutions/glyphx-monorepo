import React, { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { web as webTypes } from '@glyphx/types';

import Button from 'components/Button';

import { _deactivateAccount, _deleteWorkspace, api } from 'lib';
import { useUrl } from 'lib/client/hooks';

import { showModalAtom } from 'state';
import { useRecoilState } from 'recoil';

export const DeleteAccountModal = () => {
  const { data } = useSession();
  const url = useUrl();
  const [deleteModal, setDeleteModal] = useRecoilState(showModalAtom);

  const [verifyEmail, setVerifyEmail] = useState('');

  const verifiedEmail = verifyEmail === data.user.email;

  const handleVerifyEmailChange = (event) => setVerifyEmail(event.target.value);

  const deactivateAccount = (event) => {
    event.preventDefault();
    api({
      ..._deactivateAccount(),
      setLoading: (state) =>
        setDeleteModal(
          produce((draft: WritableDraft<webTypes.ModalsAtom>) => {
            draft.isSubmitting = state;
          })
        ),
      onSuccess: () => {
        setDeleteModal(
          produce((draft: WritableDraft<webTypes.ModalsAtom>) => {
            draft.type = webTypes.constants.MODAL_CONTENT_TYPE.CLOSED;
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
        <label className="text-sm text-gray-400">
          Enter <strong>{data.user.email}</strong> to continue:
        </label>
        <input
          className="px-3 py-2 border rounded bg-transparent"
          disabled={deleteModal.isSubmitting}
          onChange={handleVerifyEmailChange}
          type="email"
          value={verifyEmail}
        />
      </div>
      <div className="flex flex-col items-stretch">
        <Button
          className="text-white bg-red-600 hover:bg-red-500"
          disabled={!verifiedEmail || deleteModal.isSubmitting}
          onClick={deactivateAccount}
        >
          <span>Deactivate Personal Account</span>
        </Button>
      </div>
    </div>
  );
};
