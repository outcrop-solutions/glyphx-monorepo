'use client';
import React, {useTransition} from 'react';
import {getOrCreateWorkspace} from 'lib/actions/workspace';
import {Session} from 'next-auth';
import {useSession} from 'next-auth/react';

export const CredentialsBtn = () => {
  const {status} = useSession();
  const [isPending, startTransaction] = useTransition();

  return (
    <div
      className="py-2 bg-yellow rounded hover:bg-primary-yellow disabled:opacity-75 w-full text-center cursor-pointer"
      onClick={() =>
        startTransaction(async () => {
          await getOrCreateWorkspace({
            user: {
              id: '645aa1458d6a87808abf59db',
              name: 'James Test',
              email: 'james@glyphx.co',
            },
            expires: new Date().toISOString(),
          } as Session);
        })
      }
    >
      {status === 'loading' ? 'Checking session...' : 'Dev Sign In'}
    </div>
  );
};
