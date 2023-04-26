import React, { Suspense, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';

import dynamic from 'next/dynamic';
import { useSetRecoilState } from 'recoil';
import { dataGridAtom, projectAtom, rightSidebarControlAtom, workspaceAtom } from 'state';
import { useProject, useWorkspace } from 'lib/client/hooks';
import Meta from 'components/Meta';
import ProjectLayout from 'layouts/ProjectLayout';
import { useSendPosition, useSocket, useWindowSize } from 'services';
import { useCloseViewerOnEmptyDataGrid } from 'services/useCloseViewerOnEmptyDataGrid';
import produce from 'immer';

const DynamicProject = dynamic(() => import('views/project'), {
  ssr: false,
});

export default function Project() {
  const { data, isLoading } = useProject();
  const { data: result, isLoading: isWorkspaceLoading } = useWorkspace();

  // resize setup
  useWindowSize();
  useSendPosition();
  useCloseViewerOnEmptyDataGrid();

  const setWorkspace = useSetRecoilState(workspaceAtom);
  const setProject = useSetRecoilState(projectAtom);
  const setDataGrid = useSetRecoilState(dataGridAtom);
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);
  // hydrate recoil state
  useEffect(() => {
    if (!isLoading && !isWorkspaceLoading) {
      setProject(data?.project);
      setRightSidebarControl(
        produce((draft) => {
          draft.data = data?.project;
        })
      );
      setWorkspace(result?.workspace);
    }
  }, [data, isLoading, isWorkspaceLoading, result, setDataGrid, setProject, setRightSidebarControl, setWorkspace]);

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
