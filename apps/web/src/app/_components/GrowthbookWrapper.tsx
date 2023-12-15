'use client';
import React, {useEffect} from 'react';
import {GrowthBookProvider} from '@growthbook/growthbook-react';
import {usePathname} from 'next/navigation';
import {useSession} from 'next-auth/react';
import {clientGrowthBook as gb} from './clientGrowthbook';
// Provides acces to growthbook hooks in client side components
export const GrowthbookWrapper = ({children}) => {
  const pathname = usePathname();
  const session = useSession();

  useEffect(() => {
    if (gb) {
      // Load features asynchronously when the app renders
      gb.loadFeatures();

      gb.setAttributes({
        id: session?.data?.user?.id,
        userCode: session?.data?.user?.userCode,
        username: session?.data?.user?.username,
        email: session?.data?.user?.email,
        status: session?.status,
        isVerified: session?.data?.user?.emailVerified,
        browser: navigator.userAgent,
        url: pathname,
      });
    }
  }, [pathname, session]);

  return gb && <GrowthBookProvider growthbook={gb}>{children}</GrowthBookProvider>;
};
