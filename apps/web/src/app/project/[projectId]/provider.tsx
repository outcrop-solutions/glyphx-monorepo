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
import {useWindowSize} from 'services';
import useTemplates from 'lib/client/hooks/useTemplates';
// Live Page Structure
import {LiveMap} from '@liveblocks/client';
import {InitialDocumentProvider} from 'collab/lib/client';
import {RoomProvider} from 'liveblocks.config';
import {useFeatureIsOn} from '@growthbook/growthbook-react';
import {useSession} from 'next-auth/react';
import {useUrl} from 'lib/client/hooks';
import {callGlyphEngine} from 'lib/client/network/reqs/callGlyphEngine';
import useApplyState from 'services/useApplyState';

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
  const {applyState} = useApplyState();

  // keeps track of whether we have opened the first state
  const [hasDrawerBeenShown, setHasDrawerBeenShown] = useRecoilState(hasDrawerBeenShownAtom);

  // check if collab is enabled from growthbook endpoint
  const enabled = useFeatureIsOn('collaboration');

  // resize setup
  useWindowSize();

  const setWorkspace = useSetRecoilState(workspaceAtom);
  const setRowIds = useSetRecoilState(rowIdsAtom);
  const setProject = useSetRecoilState(projectAtom);
  const setTemplates = useSetRecoilState(templatesAtom);
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);
  const setCamera = useSetRecoilState(cameraAtom);
  const setImageHash = useSetRecoilState(imageHashAtom);

  // hydrate recoil state
  useEffect(() => {
    if (!templateLoading) {
      // rectify mongo scalar array
      const newFormattedProject = produce(project, (draft) => {
        draft.files = draft.files.map((file, idx) => (idx === 0 ? {...file, selected: true, open: true} : file));

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

      setProject(newFormattedProject);
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
    const filtered = project.stateHistory.filter((s) => !s.deletedAt);
    if (Array.isArray(filtered) && filtered?.length > 0) {
      const idx = filtered.length - 1;
      const state = filtered[idx];
      if (state) {
        applyState(state);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasDrawerBeenShown) {
      // Logic to show the drawer
      openLastState();
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
