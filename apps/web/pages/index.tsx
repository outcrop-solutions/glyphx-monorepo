import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { HomeErrorFallback, HomeSuspenseFallback } from 'partials/fallback';

import dynamic from 'next/dynamic';
import { ToastWrapper } from 'partials/layout/ToastWrapper';
import { useRouter } from 'next/router';
const DynamicHome = dynamic(() => import('views/home'), {
  ssr: false,
  // suspense: true,
});

export default function Projects() {
  const router = useRouter();
  const { orgId } = router.query;

  // const session = useRequireAuth();
  // const { data } = useSWR(session && typeof orgId !== 'undefined' && `/api/project?orgId=${orgId}`, fetcher);
  // const { data } = useSWR(typeof orgId !== 'undefined' && `/api/project`, fetcher);

  return (
    <div className="flex h-screen w-screen scrollbar-none bg-primary-dark-blue">
      <ToastWrapper>
        <ErrorBoundary FallbackComponent={HomeErrorFallback} resetKeys={[]}>
          {/* Fallback for when data is loading */}
          {/* <Suspense fallback={<HomeSuspenseFallback />}> */}
          <DynamicHome />
          {/* </Suspense> */}
        </ErrorBoundary>
      </ToastWrapper>
    </div>
  );
}