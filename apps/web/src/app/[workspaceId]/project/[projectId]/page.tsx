'use client';
import React, {useEffect} from 'react';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';
import {useSetRecoilState} from 'recoil';
import {dataGridAtom, projectAtom, rightSidebarControlAtom, templatesAtom, workspaceAtom} from 'state';
import {useSendPosition, useWindowSize} from 'services';
import {useCloseViewerOnModalOpen} from 'services/useCloseViewerOnModalOpen';
import {useProject, useWorkspace} from 'lib/client/hooks';
import {useCloseViewerOnLoading} from 'services/useCloseViewerOnLoading';
import {GridContainer} from 'app/[workspaceId]/project/[projectId]/_components/datagrid/GridContainer';
import useTemplates from 'lib/client/hooks/useTemplates';

const openFirstFile = (projData) => {
  const newFiles = projData?.files.map((file, idx) => (idx === 0 ? {...file, selected: true, open: true} : file));
  return {
    ...projData,
    files: [...newFiles],
  };
};

export default function Project() {
  const {data, isLoading} = useProject();
  const {data: templateData, isLoading: templateLoading} = useTemplates();
  const {data: result, isLoading: isWorkspaceLoading} = useWorkspace();

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
    setTemplates,
    templateData,
  ]);

  return <GridContainer />;
}
