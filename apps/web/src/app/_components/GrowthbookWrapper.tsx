'use client';
import React, {useEffect} from 'react';
import {GrowthBookProvider} from '@growthbook/growthbook-react';
import {usePathname} from 'next/navigation';
import {useSession} from 'next-auth/react';
import {clientGrowthbook as growthbook} from './clientGrowthbook';
const FEATURES_ENDPOINT = 'http://localhost:3100/api/features/key_abc123';

// Provides acces to growthbook hooks in client side components
export const GrowthbookWrapper = ({children}) => {
  const pathname = usePathname();
  const session = useSession();

  useEffect(() => {
    // Load features asynchronously when the app renders
    growthbook.loadFeatures();

    fetch(FEATURES_ENDPOINT)
      .then((res) => res.json())
      .then((json) => {
        growthbook.setFeatures(json.features);
      });

    growthbook.setAttributes({
      id: session?.data?.user?.id,
      userCode: session?.data?.user?.userCode,
      username: session?.data?.user?.username,
      email: session?.data?.user?.email,
      status: session?.status,
      isVerified: session?.data?.user?.emailVerified,
      browser: navigator.userAgent,
      url: pathname,
    });
  }, [pathname, session]);

  return <GrowthBookProvider growthbook={growthbook}>{children}</GrowthBookProvider>;
};
