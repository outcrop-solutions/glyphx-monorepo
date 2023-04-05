import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';

import dynamic from 'next/dynamic';
import { useSetRecoilState } from 'recoil';
import { projectAtom, workspaceAtom } from 'state';
import { useProject, useWorkspace } from 'lib/client/hooks';

const DynamicProject = dynamic(() => import('views/project'), {
  ssr: false,
});

export default function Project() {
  const { data: result, isLoading: isWorkspaceLoading } = useWorkspace();
  const { data, isLoading } = useProject();

  const setWorkspace = useSetRecoilState(workspaceAtom);
  const setProject = useSetRecoilState(projectAtom);

  // hydrate recoil state
  useEffect(() => {
    if (!isLoading && !isWorkspaceLoading) {
      setWorkspace(result.workspace);
      setProject(data.project);
    }
  }, [data, isLoading, isWorkspaceLoading, result, setProject, setWorkspace]);

  return (
    !isLoading && (
      <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
        <DynamicProject />
      </ErrorBoundary>
    )
  );
}
