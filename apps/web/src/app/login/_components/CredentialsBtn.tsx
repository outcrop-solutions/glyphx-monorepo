'use client';
import {signIn, useSession} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import React from 'react';

export const CredentialsBtn = () => {
  const router = useRouter();
  const {status} = useSession();

  return (
    <div
      className="py-2 bg-yellow rounded hover:bg-primary-yellow disabled:opacity-75 w-full text-center"
      onClick={() => {
        router.push('/account');
      }}
    >
      {status === 'loading' ? 'Checking session...' : 'Dev Sign In'}
    </div>
  );
};
