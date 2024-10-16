'use client';
import React, {useCallback, useEffect, useRef} from 'react';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {databaseTypes, fileIngestionTypes, webTypes} from 'types';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {
  cameraAtom,
  hasDrawerBeenShownAtom,
  imageHashAtom,
  selectedGlyphsAtom,
  projectAtom,
  rightSidebarControlAtom,
  rowIdsAtom,
  templatesAtom,
  workspaceAtom,
  modelRunnerAtom,
} from 'state';
import {useWindowSize} from 'services';
import useTemplates from 'lib/client/hooks/useTemplates';
// Live Page Structure
import {LiveMap} from '@liveblocks/client';
import {InitialDocumentProvider} from 'collab/lib/client';
import {RoomProvider} from 'liveblocks.config';
import {useFeatureIsOn} from '@growthbook/growthbook-react';
import useApplyState from 'services/useApplyState';
import useWasm from '../../../lib/client/hooks/useWasm';
import {createState} from 'actions';

export enum EVENTS {
  SELECTED_GLYPHS = 'SELECTED_GLYPHS',
  SCREENSHOT_TAKEN = 'SCREENSHOT_TAKEN',
}

export const ProjectProvider = ({
  children,
  doc,
  project,
}: {
  children: React.ReactNode;
  doc: any;
  project: databaseTypes.IProject;
}) => {
  const projectViewRef = useRef(null);
  const {data: templateData, isLoading: templateLoading} = useTemplates();
  const rowIds = useRecoilValue(rowIdsAtom);
  const [modelRunnerState, setModelRunnerState] = useRecoilState(modelRunnerAtom);
  const {applyState} = useApplyState();

  // keeps track of whether we have opened the first state
  const [hasDrawerBeenShown, setHasDrawerBeenShown] = useRecoilState(hasDrawerBeenShownAtom);

  // check if collab is enabled from growthbook endpoint
  const enabled = useFeatureIsOn('collaboration');

  // resize setup
  useWindowSize();

  const setWorkspace = useSetRecoilState(workspaceAtom);
  const setRowIds = useSetRecoilState(rowIdsAtom);
  const setLastSelectedGlyph = useSetRecoilState(selectedGlyphsAtom);
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

  const handleSelectedGlyphs = useCallback(
    (selectedGlyphs) => {
      // if empty, reset state
      if (!selectedGlyphs || selectedGlyphs?.length === 0) {
        setRowIds([]);
        setLastSelectedGlyph({});
        return;
      }

      // accumulate rowIds
      const rowIds = selectedGlyphs.flatMap((g) => g?.get('row_ids'));
      setRowIds(rowIds);

      // display latest
      const last = selectedGlyphs[selectedGlyphs.length - 1];
      const desc: Map<string, any> = last.get('desc');
      const glyphId: number = last.get('glyph_id');
      setLastSelectedGlyph({desc, glyphId});
    },
    [setLastSelectedGlyph, setRowIds]
  );

  const handleScreenshotTaken = useCallback(
    async (screenshot) => {
      console.log('Screenshot taken:', screenshot);
      const {width, height, pixels} = screenshot;
      // get aspect ratio
      const aspect = {
        width,
        height,
      };
      // get camera data
      const camera = JSON.parse(modelRunnerState.modelRunner.get_camera_data());
      // setup canvas scratch space
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempContext = tempCanvas.getContext('2d');
      // format image
      const image = new Uint8ClampedArray(pixels);
      const imageData = new ImageData(image, width, height);
      tempContext?.putImageData(imageData, 0, 0);
      // Download the image data
      const dataUrl = tempCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'canvas-screenshot.png';
      link.click();

      // create the state
      if (image) {
        const rows = (rowIds ? rowIds : []) as unknown as number[];
        // TODO: the image needs to be uploaded to s3
        const retval = await createState('', camera, project.id, image, aspect, rows);
        if (retval?.state) {
          applyState(retval?.state);
        }
      }
    },
    [applyState, modelRunnerState.modelRunner, project.id, rowIds]
  );

  // Create a map of event types to their respective callbacks
  const callbacks = new Map([
    [EVENTS.SELECTED_GLYPHS, handleSelectedGlyphs],
    [EVENTS.SCREENSHOT_TAKEN, handleScreenshotTaken],
  ]);

  // Use the hook with the map of callbacks
  useWasm(callbacks);

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
