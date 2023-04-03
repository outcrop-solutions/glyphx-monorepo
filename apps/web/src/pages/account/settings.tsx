import React, { Suspense } from 'react';
import { getSession } from 'next-auth/react';
import { ErrorBoundary } from 'react-error-boundary';

import { userService, Initializer } from '@glyphx/business';

import Meta from 'components/Meta';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { AccountLayout } from 'layouts';
import { _deactivateAccount, _updateUserName, _updateUserEmail } from 'lib/client';

import dynamic from 'next/dynamic';
const DynamicSettings = dynamic(() => import('views/settings'), {
  ssr: false,
  suspense: true,
});

const Settings = ({ user }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
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
  if (!Initializer.inited) {
    await Initializer.init();
  }
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
