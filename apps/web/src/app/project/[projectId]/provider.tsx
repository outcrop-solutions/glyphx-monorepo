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
import {callGlyphEngine} from 'lib/client/network/reqs/callGlyphEngine';

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

  const setRowIds = useSetRecoilState(rowIdsAtom);
  const setProject = useSetRecoilState(projectAtom);
  const setTemplates = useSetRecoilState(templatesAtom);
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);
  const setCamera = useRecoilState(cameraAtom);
  const setImageHash = useSetRecoilState(imageHashAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setActiveState = useSetRecoilState(activeStateAtom);

  // hydrate recoil state
  useEffect(() => {
    if (!templateLoading && templateData) {
      // rectify mongo scalar array
      const newFormattedProject = produce(project, (draft) => {
        draft.files = draft.files.map((file, idx) => (idx === 0 ? {...file, selected: true, open: true} : file));
        draft.stateHistory = draft.stateHistory.filter((s) => !s.deletedAt);
        Object.values(draft.state.properties).forEach((prop: webTypes.Property) => {
          if (
            prop.dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING ||
            prop.dataType === fileIngestionTypes.constants.FIELD_TYPE.DATE
          ) {
            const {keywords} = prop.filter as unknown as webTypes.IStringFilter;
            if (keywords && keywords.length > 0) {
              draft.state.properties[prop.axis] = {
                ...draft.state.properties[prop.axis],
                filter: {
                  ...draft.state.properties[prop.axis].filter,
                  keywords: [
                    ...keywords.map((word) => {
                      return Object.values(word).join('');
                    }),
                  ],
                },
              };
            }
          }
        });
      });

      console.log({project, newFormattedProject});
      setProject(newFormattedProject);
      setRowIds(false);
      setTemplates(templateData);
      setRightSidebarControl(
        produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
          draft.data = project;
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateLoading, templateData, project]);

  const openLastState = useCallback(async () => {
    const filtered = project.stateHistory.filter((s) => !s.deletedAt);
    if (Array.isArray(filtered) && filtered?.length > 0) {
      const idx = filtered.length - 1;
      const {id, camera, rowIds} = filtered[idx];
      if (id) {
        setActiveState(id);
        await callGlyphEngine({
          project,
          setLoading,
          setDrawer,
          setResize,
          setImageHash,
          setCamera,
          stateId: id,
          camera,
          rowIds,
        });
        console.log('openLastState', {stateId: id});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
