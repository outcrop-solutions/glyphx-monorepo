'use client';
import {signIn} from 'next-auth/react';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {authEmailAtom} from 'state';

export const CredentialsBtn = () => {
  const email = useRecoilValue(authEmailAtom);

  return (
    <div
      className="py-2 bg-yellow rounded hover:bg-primary-yellow disabled:opacity-75 w-full text-center"
      onClick={() => signIn('credentials', {redirect: true}, {email})}
    >
      Dev Sign In
    </div>
  );
};
