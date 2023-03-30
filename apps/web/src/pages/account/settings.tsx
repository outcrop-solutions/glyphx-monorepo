import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { getSession } from 'next-auth/react';
import Meta from 'components/Meta';
import { AccountLayout } from 'layouts';
import { _deactivateAccount, _updateUserName, _updateUserEmail, api } from 'lib/client';
import { userService, Initializer } from '@glyphx/business';

import dynamic from 'next/dynamic';
const DynamicSettings = dynamic(() => import('views/settings'), {
  ssr: false,
  suspense: true,
});

const Settings = ({ user }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      {/* Fallback for when data is loading */}
      <Suspense fallback={SuspenseFallback}>
        <AccountLayout>
          <Meta title="Glyphx - Account Settings" />
          <DynamicSettings user={user} />
        </AccountLayout>
      </Suspense>
    </ErrorBoundary>
  );
};

export const getServerSideProps = async (context) => {
  await Initializer.init();
  const session = await getSession(context);
  const { email, name, userCode } = await userService.getUser(session?.user?.userId);

  return {
    props: JSON.parse(
      JSON.stringify({
        user: {
          email: email ? email : null,
          name: name ? name : null,
          userCode: userCode ? userCode : session?.user?.userId,
        },
      })
    ),
  };
};

export default Settings;
