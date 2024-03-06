'use client';
import React, {useTransition} from 'react';
import {getOrCreateWorkspace} from 'actions';
import {useSession} from 'next-auth/react';

export const CredentialsBtn = () => {
  const {status} = useSession();
  const [isPending, startTransaction] = useTransition();

  return (
    <div
      className="py-2 bg-yellow rounded hover:bg-primary-yellow disabled:opacity-75 w-full text-center cursor-pointer"
      onClick={() =>
        startTransaction(async () => {
          await getOrCreateWorkspace();
        })
      }
    >
      {status === 'loading' ? 'Checking session...' : 'Dev Sign In'}
    </div>
  );
};
