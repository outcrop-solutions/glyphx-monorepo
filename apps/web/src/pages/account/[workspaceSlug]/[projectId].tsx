import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import { useRouter } from 'next/router';

import dynamic from 'next/dynamic';
import { useSetRecoilState } from 'recoil';
import { projectAtom } from 'state';
import { useProject } from 'lib/client/hooks';

const DynamicProject = dynamic(() => import('views/project'), {
  ssr: false,
  // suspense: true,
});

export default function Project() {
  const { data, isLoading } = useProject();
  const setProject = useSetRecoilState(projectAtom);

  // hydrate recoil state
  useEffect(() => {
    if (!isLoading) {
      setProject(data.project);
    }
  }, [data, isLoading, setProject]);

  return (
    !isLoading && (
      <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
        <Suspense fallback={SuspenseFallback}>
          <DynamicProject />
        </Suspense>
      </ErrorBoundary>
    )
  );
}
