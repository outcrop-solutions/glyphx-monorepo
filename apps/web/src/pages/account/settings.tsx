import React, { Suspense } from 'react';
import { getSession, useSession } from 'next-auth/react';
import { ErrorBoundary } from 'react-error-boundary';

import { userService, Initializer } from '@glyphx/business';

import Meta from 'components/Meta';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { AccountLayout } from 'layouts';
import { _deactivateAccount, _updateUserName, _updateUserEmail } from 'lib/client';

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
