'use client';
import React, {useEffect} from 'react';
import {ClientSafeProvider, getProviders} from 'next-auth/react';
import {useSetRecoilState} from 'recoil';
import {authProvidersAtom, permissionsAtom} from 'state';

export const AuthProviders = ({permissions, children}) => {
  const setSocialProviders = useSetRecoilState(authProvidersAtom);
  const setPermissions = useSetRecoilState(permissionsAtom);

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

  useEffect(() => {
    setPermissions(permissions);
  }, [permissions, setPermissions]);

  return <>{children}</>;
};
