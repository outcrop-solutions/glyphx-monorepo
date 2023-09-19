'use client';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {ProviderBtn} from './ProviderBtn';
import {authProvidersAtom} from 'state';

export const Providers = () => {
  const socialProviders = useRecoilValue(authProvidersAtom);
  return (
    <>
      {socialProviders?.length > 0 && (
        <>
          <span className="text-sm text-white">or sign in with</span>
          <div className="flex flex-col w-full space-y-3">
            {socialProviders.map((provider, index) => (
              <ProviderBtn key={index} provider={provider} index={index} />
            ))}
          </div>
        </>
      )}
    </>
  );
};
