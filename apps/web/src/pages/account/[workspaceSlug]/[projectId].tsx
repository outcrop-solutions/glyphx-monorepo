import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { web as webTypes } from '@glyphx/types';
import ProjectLayout from 'layouts/ProjectLayout';
import Meta from 'components/Meta';

import { useRecoilValue, useSetRecoilState } from 'recoil';
import { dataGridAtom, projectAtom, rightSidebarControlAtom, splitPaneSizeAtom, workspaceAtom } from 'state';

import { useSendPosition, useSocket, useWindowSize } from 'services';
import { useCloseViewerOnModalOpen } from 'services/useCloseViewerOnModalOpen';
import { useProject, useWorkspace } from 'lib/client/hooks';
import { useCloseViewerOnLoading } from 'services/useCloseViewerOnLoading';

const DynamicProject = dynamic(() => import('views/project'), {
  ssr: false,
});

export default function Project() {
  const { data, isLoading } = useProject();
  const { data: result, isLoading: isWorkspaceLoading } = useWorkspace();

  // const resize = useRecoilValue(splitPaneSizeAtom);

  // useEffect(() => {
  //   console.log({ resize });
  // }, [resize]);

  // resize setup
  useWindowSize();
  useSendPosition();
  useCloseViewerOnModalOpen();
  useCloseViewerOnLoading();

  const setWorkspace = useSetRecoilState(workspaceAtom);
  const setProject = useSetRecoilState(projectAtom);
  const setDataGrid = useSetRecoilState(dataGridAtom);
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);
  // hydrate recoil state
  useEffect(() => {
    if (!isLoading && !isWorkspaceLoading) {
      setProject(data?.project);
      setRightSidebarControl(
        produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
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
