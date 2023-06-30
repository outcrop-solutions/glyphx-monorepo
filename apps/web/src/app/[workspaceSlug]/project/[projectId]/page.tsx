import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';

import { web as webTypes } from '@glyphx/types';

import { useSetRecoilState } from 'recoil';
import { dataGridAtom, projectAtom, rightSidebarControlAtom, workspaceAtom } from 'state';

import { useSendPosition, useSocket, useWindowSize } from 'services';
import { useCloseViewerOnModalOpen } from 'services/useCloseViewerOnModalOpen';
import { useProject, useWorkspace } from 'lib/client/hooks';
import { useCloseViewerOnLoading } from 'services/useCloseViewerOnLoading';
import { GridContainer } from 'app/[workspaceSlug]/project/[projectId]/_components/datagrid/GridContainer';

const openFirstFile = (projData) => {
  const newFiles = projData.files.map((file, idx) => (idx === 0 ? { ...file, selected: true, open: true } : file));
  return {
    ...projData,
    files: [...newFiles],
  };
};

export default function Project() {
  const { data, isLoading } = useProject();
  const { data: result, isLoading: isWorkspaceLoading } = useWorkspace();

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
      const projectData = openFirstFile(data?.project);
      setProject(projectData);
      setRightSidebarControl(
        produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
          draft.data = data?.project;
        })
      );
      setWorkspace(result?.workspace);
    }
  }, [data, isLoading, isWorkspaceLoading, result, setDataGrid, setProject, setRightSidebarControl, setWorkspace]);

  useSocket();

  return <GridContainer />;
}
