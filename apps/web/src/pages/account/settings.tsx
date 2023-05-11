import React, { Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { ErrorBoundary } from 'react-error-boundary';

import Meta from 'components/Meta';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { AccountLayout } from 'layouts';

import SettingsView from 'views/settings';

const Settings = () => {
  const { data } = useSession();
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      <Suspense fallback={SuspenseFallback}>
        <AccountLayout>
          <Meta title="Glyphx - Account Settings" />
          <SettingsView />
        </AccountLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export default Settings;
