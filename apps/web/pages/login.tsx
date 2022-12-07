import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { SignInErrorFallback } from '@/partials/fallback/signin.error';
import { SignInSuspenseFallback } from '@/partials/fallback/signin.suspense';

import dynamic from 'next/dynamic';
import { AuthLayout } from '@/partials/layout/AuthLayout';
import { getUrl } from 'constants/config';
import { ToastWrapper } from '../partials';

// const DynamicSignIn = dynamic(() => import('views/auth/signin'), {
//   ssr: false,
// });

import { Signin } from 'views/auth/signin';

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
            <Signin referer={'http://localhost:3000/clbdzrmlg0000re43iau05wuy'} />
          </Suspense>
        </ToastWrapper>
      </ErrorBoundary>
    </AuthLayout>
  );
}

// export async function getServerSideProps(context) {
//   // console.log({ referer: context.req.headers.referer });
//   if (typeof context.req.headers.referer !== undefined && context.req.headers.referer?.includes('dashboard')) {
//     return { props: { referer: context.req.headers.referer } };
//   } else {
//     // TODO: change to include ccargocom depending on env
//     return { props: { referer: `${getUrl()}/invite` } };
//   }
// }
