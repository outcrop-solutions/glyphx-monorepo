'use client';
import React from 'react';
import {signIn, useSession} from 'next-auth/react';

export const ProviderBtn = ({provider, index}) => {
  const {status} = useSession();

  return (
    <button
      key={index}
      className="py-2 bg-secondary-midnight border rounded hover:bg-gray-50 disabled:opacity-75 text-white"
      disabled={status === 'loading'}
      onClick={() => signIn(provider.id)}
    >
      {provider.name}
    </button>
  );
};
