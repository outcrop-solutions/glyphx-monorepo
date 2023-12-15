'use client';
import React, {useEffect, useRef, useState} from 'react';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';
import {useSetRecoilState} from 'recoil';
import {dataGridAtom, projectAtom, rightSidebarControlAtom, templatesAtom, workspaceAtom} from 'state';
import {useSendPosition, useWindowSize} from 'services';
import {useCloseViewerOnModalOpen} from 'services/useCloseViewerOnModalOpen';
import {useCloseViewerOnLoading} from 'services/useCloseViewerOnLoading';
import useTemplates from 'lib/client/hooks/useTemplates';
// Live Page Structure
import {LiveMap} from '@liveblocks/client';
import {InitialDocumentProvider} from 'collab/lib/client';
import {RoomProvider} from 'liveblocks.config';
import {useEnv} from 'lib/client/hooks';

const openFirstFile = (projData) => {
  const newFiles = projData?.files.map((file, idx) => (idx === 0 ? {...file, selected: true, open: true} : file));
  return {
    ...projData,
    files: [...newFiles],
  };
};

export const ProjectProvider = ({children, doc, project}: {children: React.ReactNode; doc: any; project: any}) => {
  const {data: templateData, isLoading: templateLoading} = useTemplates();

  const projectViewRef = useRef(null);

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
    if (!templateLoading) {
      const projectData = openFirstFile(project);
      setProject(projectData);
      setTemplates(templateData);
      setRightSidebarControl(
        produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
          draft.data = project;
        })
      );
    }
  }, [
    templateLoading,
    setDataGrid,
    setProject,
    setRightSidebarControl,
    setWorkspace,
    setTemplates,
    templateData,
    project,
  ]);

  return false ? (
    <RoomProvider id={project.docId as string} initialPresence={{cursor: null}} initialStorage={{notes: new LiveMap()}}>
      <InitialDocumentProvider initialDocument={doc}>
        <div ref={projectViewRef} className="flex w-full h-full">
          {children}
        </div>
      </InitialDocumentProvider>
    </RoomProvider>
  ) : (
    <div ref={projectViewRef} className="flex w-full h-full">
      {children}
    </div>
  );
};
