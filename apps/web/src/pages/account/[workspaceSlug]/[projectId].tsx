import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';

import dynamic from 'next/dynamic';
import { useSetRecoilState } from 'recoil';
import { dataGridAtom, projectAtom, workspaceAtom } from 'state';
import { useProject, useWorkspace } from 'lib/client/hooks';
import Meta from 'components/Meta';
import ProjectLayout from 'layouts/ProjectLayout';
import Content from 'components/Content';
import { useSocket } from 'services';

const DynamicProject = dynamic(() => import('views/project'), {
  ssr: false,
});

export default function Project() {
  const { data, isLoading } = useProject();
  const { data: result, isLoading: isWorkspaceLoading } = useWorkspace();

  const setWorkspace = useSetRecoilState(workspaceAtom);
  const setProject = useSetRecoilState(projectAtom);
  const setDataGrid = useSetRecoilState(dataGridAtom);
  // hydrate recoil state
  useEffect(() => {
    if (!isLoading && !isWorkspaceLoading) {
      setProject(data?.project);
      setWorkspace(result?.workspace);
    }
  }, [data, isLoading, isWorkspaceLoading, result, setDataGrid, setProject, setWorkspace]);

  useSocket();

  return (
    !isLoading && (
      // <ErrorBoundary FallbackComponent={ErrorFallback} resetKeys={[]} onReset={() => {}}>
      <ProjectLayout>
        <Meta title={`Glyphx - ${data?.project?.name} | Project`} />
        <DynamicProject />
      </ProjectLayout>
      // </ErrorBoundary>
    )
  );
}
