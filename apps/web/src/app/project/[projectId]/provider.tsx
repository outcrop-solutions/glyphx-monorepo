'use client';
import React, {useCallback, useEffect, useRef} from 'react';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {databaseTypes, fileIngestionTypes, webTypes} from 'types';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {
  activeStateAtom,
  cameraAtom,
  drawerOpenAtom,
  hasDrawerBeenShownAtom,
  imageHashAtom,
  projectAtom,
  rightSidebarControlAtom,
  rowIdsAtom,
  showLoadingAtom,
  splitPaneSizeAtom,
  templatesAtom,
  workspaceAtom,
} from 'state';
import {useSendPosition, useWindowSize} from 'services';
import {useCloseViewerOnModalOpen} from 'services/useCloseViewerOnModalOpen';
import {useCloseViewerOnLoading} from 'services/useCloseViewerOnLoading';
import useTemplates from 'lib/client/hooks/useTemplates';
// Live Page Structure
import {LiveMap} from '@liveblocks/client';
import {InitialDocumentProvider} from 'collab/lib/client';
import {RoomProvider} from 'liveblocks.config';
import {useFeatureIsOn} from '@growthbook/growthbook-react';
import {callDownloadModel} from 'lib/client/network/reqs/callDownloadModel';
import {useSession} from 'next-auth/react';
import {useUrl} from 'lib/client/hooks';

const openFirstFile = (projData) => {
  const newFiles = projData?.files.map((file, idx) => (idx === 0 ? {...file, selected: true, open: true} : file));
  return {
    ...projData,
    files: [...newFiles],
  };
};

export const ProjectProvider = ({
  children,
  doc,
  project,
}: {
  children: React.ReactNode;
  doc: any;
  project: databaseTypes.IProject;
}) => {
  const {data: templateData, isLoading: templateLoading} = useTemplates();
  const session = useSession();
  const url = useUrl();
  const projectViewRef = useRef(null);

  // keeps track of whether we have opened the first state
  const [hasDrawerBeenShown, setHasDrawerBeenShown] = useRecoilState(hasDrawerBeenShownAtom);

  // check if collab is enabled from growthbook endpoint
  const enabled = useFeatureIsOn('collaboration');

  // resize setup
  useWindowSize();
  useSendPosition();
  useCloseViewerOnModalOpen();
  useCloseViewerOnLoading();

  const setWorkspace = useSetRecoilState(workspaceAtom);
  const setRowIds = useSetRecoilState(rowIdsAtom);
  const setProject = useSetRecoilState(projectAtom);
  const setTemplates = useSetRecoilState(templatesAtom);
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);
  const setCamera = useSetRecoilState(cameraAtom);
  const setImageHash = useSetRecoilState(imageHashAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setActiveState = useSetRecoilState(activeStateAtom);

  // hydrate recoil state
  useEffect(() => {
    if (!templateLoading) {
      const projectData = openFirstFile(project);

      let formattedProject = {...projectData};
      // rectify mongo scalar array
      Object.values(projectData.state.properties).forEach((prop: webTypes.Property) => {
        if (
          prop.dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING ||
          prop.dataType === fileIngestionTypes.constants.FIELD_TYPE.DATE
        ) {
          const {keywords} = prop.filter as unknown as webTypes.IStringFilter;
          if (keywords && keywords.length > 0) {
            formattedProject.state.properties[prop.axis].filter.keywords = [
              ...keywords.map((word) => {
                return Object.values(word).join('');
              }),
            ];
          }
        }
      });
      setProject(formattedProject);
      setRowIds(false);
      setTemplates(templateData);
      setRightSidebarControl(
        produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
          draft.data = project;
        })
      );
    }
  }, [
    templateLoading,
    setProject,
    setRightSidebarControl,
    setWorkspace,
    setTemplates,
    templateData,
    project,
    setRowIds,
    setCamera,
    setImageHash,
  ]);

  const openLastState = useCallback(async () => {
    if (Array.isArray(project.stateHistory) && project.stateHistory?.length > 0) {
      const idx = project.stateHistory.length - 1;
      const lastState = project.stateHistory[idx];
      const camera = lastState.camera;

      await callDownloadModel({
        isLastState: true,
        project,
        session,
        url,
        setLoading,
        setDrawer,
        setResize,
        camera,
      });
      setActiveState(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  useEffect(() => {
    if (!hasDrawerBeenShown) {
      // Logic to show the drawer
      openLastState();
      // Then update the state to reflect that the drawer has been shown
      setHasDrawerBeenShown(true);
    }
    return () => {
      setHasDrawerBeenShown(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return enabled && project?.docId ? (
    <RoomProvider
      id={project?.docId as string}
      initialPresence={{cursor: null}}
      initialStorage={{notes: new LiveMap()}}
    >
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
