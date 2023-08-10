import React, { Suspense, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback, SuspenseFallback } from 'partials/fallback';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { web as webTypes } from '@glyphx/types';
import ProjectLayout from 'layouts/ProjectLayout';
import Meta from 'components/Meta';

import { useSetRecoilState } from 'recoil';
import { dataGridAtom, projectAtom, rightSidebarControlAtom, templatesAtom, workspaceAtom } from 'state';

import { useSendPosition, useSocket, useWindowSize } from 'services';
import { useCloseViewerOnModalOpen } from 'services/useCloseViewerOnModalOpen';
import { useProject, useWorkspace } from 'lib/client/hooks';
import { useCloseViewerOnLoading } from 'services/useCloseViewerOnLoading';
import useTemplates from 'lib/client/hooks/useTemplates';

const DynamicProject = dynamic(() => import('views/project'), {
  ssr: false,
});

const openFirstFile = (projData) => {
  const newFiles = projData.files.map((file, idx) => (idx === 0 ? { ...file, selected: true, open: true } : file));
  return {
    ...projData,
    files: [...newFiles],
  };
};

export default function Project() {
  const { data, isLoading } = useProject();
  const { data: templateData, isLoading: templateLoading } = useTemplates();
  const { data: result, isLoading: isWorkspaceLoading } = useWorkspace();

  // resize setup
  useWindowSize();
  useSendPosition();
  useCloseViewerOnModalOpen();
  useCloseViewerOnLoading();

  const setWorkspace = useSetRecoilState(workspaceAtom);
  const setProject = useSetRecoilState(projectAtom);
  const setTemplates = useSetRecoilState(templatesAtom);
  const setDataGrid = useSetRecoilState(dataGridAtom);
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);
  // hydrate recoil state
  useEffect(() => {
    if (!isLoading && !isWorkspaceLoading && !templateLoading) {
      const projectData = openFirstFile(data?.project);
      setProject(projectData);
      setTemplates(templateData);
      setRightSidebarControl(
        produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
          draft.data = data?.project;
        })
      );
      setWorkspace(result?.workspace);
    }
  }, [
    data,
    isLoading,
    templateLoading,
    isWorkspaceLoading,
    result,
    setDataGrid,
    setProject,
    setRightSidebarControl,
    setWorkspace,
  ]);

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
