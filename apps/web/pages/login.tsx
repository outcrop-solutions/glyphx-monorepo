import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { SignInErrorFallback } from 'partials/fallback/signin.error';
import { SignInSuspenseFallback } from 'partials/fallback/signin.suspense';
import { AuthLayout } from 'partials/layout/AuthLayout';
import { ToastWrapper } from '../partials';

import { NextSignIn } from 'views/auth/next-auth';

// AUTHENTICATION PAGE FOR NEXT-AUTH

export default function SignIn({ referer }) {
  return (
    <AuthLayout>
      <ErrorBoundary
        FallbackComponent={SignInErrorFallback}
        resetKeys={[]}
        onReset={() => {
          // setProjects([]);
        }}
      >
        <ToastWrapper>
          {/* Fallback for when data is loading */}
          <Suspense fallback={SignInSuspenseFallback}>
            <NextSignIn referer={'http://localhost:3000/test'} />
          </Suspense>
        </ToastWrapper>
      </ErrorBoundary>
    </AuthLayout>
  );
}

// export async function getServerSideProps(context) {
//   if (typeof context.req.headers.referer !== undefined && context.req.headers.referer?.includes('dashboard')) {
//     return { props: { referer: context.req.headers.referer } };
//   } else {
//     // TODO: change to include ccargocom depending on env
//     return { props: { referer: `${getUrl()}/invite` } };
//   }
// }
