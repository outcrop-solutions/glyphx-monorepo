'use client';
import React, {useEffect} from 'react';
import {ClientSafeProvider, getProviders} from 'next-auth/react';
import {useSetRecoilState} from 'recoil';
import {authProvidersAtom} from 'state';

export const AuthProviders = ({children}) => {
  const setSocialProviders = useSetRecoilState(authProvidersAtom);

  useEffect(() => {
    (async () => {
      const socialProviders = [] as ClientSafeProvider[];
      const providers = await getProviders();
      if (providers) {
        // extract email provider to handle differently
        const {email, credentials, ...rest} = providers;
        for (const provider in rest) {
          socialProviders.push(providers[provider]);
        }
        setSocialProviders([...socialProviders]);
      }
    })();
  }, [setSocialProviders]);

  return <>{children}</>;
};
