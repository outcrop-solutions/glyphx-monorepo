import React, { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { useRouter } from 'next/router';

import dynamic from 'next/dynamic';

const DynamicProject = dynamic(() => import('views/project'), {
  ssr: false,
  // suspense: true,
});

export default function Project() {
  const router = useRouter();
  const { workspaceSlug, projectId } = router.query;
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[projectId, workspaceSlug]} onReset={() => {}}>
      <Suspense fallback={SuspenseFallback}>
        <DynamicProject />
      </Suspense>
    </ErrorBoundary>
  );
}
