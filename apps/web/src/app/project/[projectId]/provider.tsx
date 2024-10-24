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
  lastSelectedGlyphAtom,
  projectAtom,
  rightSidebarControlAtom,
  rowIdsAtom,
  templatesAtom,
  workspaceAtom,
  activeStateNameAtom,
  isSubmittingAtom,
  showStateInputAtom,
  modelRunnerSelector,
} from 'state';
import {useWindowSize} from 'services';
import useTemplates from 'lib/client/hooks/useTemplates';
// Live Page Structure
import {LiveMap} from '@liveblocks/client';
import {InitialDocumentProvider} from 'collab/lib/client';
import {RoomProvider} from 'liveblocks.config';
import {useFeatureIsOn} from '@growthbook/growthbook-react';
import {createState} from 'actions';
import {useActionContext} from './_components/ActionProvider';

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
  const [name, setName] = useRecoilState(activeStateNameAtom);
  const {data: templateData, isLoading: templateLoading} = useTemplates();
  const rowIds = useRecoilValue(rowIdsAtom);
  const modelRunner = useRecoilValue(modelRunnerSelector);
  const {applyState} = useActionContext();

  // keeps track of whether we have opened the first state
  const [hasDrawerBeenShown, setHasDrawerBeenShown] = useRecoilState(hasDrawerBeenShownAtom);

  // check if collab is enabled from growthbook endpoint
  const enabled = useFeatureIsOn('collaboration');

  // resize setup
  useWindowSize();

  const setWorkspace = useSetRecoilState(workspaceAtom);
  const setRowIds = useSetRecoilState(rowIdsAtom);
  const setLastSelectedGlyph = useSetRecoilState(lastSelectedGlyphAtom);
  const setTemplates = useSetRecoilState(templatesAtom);
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);
  const setCamera = useSetRecoilState(cameraAtom);
  const setImageHash = useSetRecoilState(imageHashAtom);
  const setIsSubmitting = useSetRecoilState(isSubmittingAtom);
  const setAddState = useSetRecoilState(showStateInputAtom);

  // hydrate recoil state
  useEffect(() => {
    if (!templateLoading) {
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
        console.log('openlaststate', {state});
        applyState(state);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyState]);

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

  // create a state
  useEffect(() => {
    const handleNewState = async (event) => {
      try {
        const {width, height, pixels} = event.detail['ScreenShotTaken'];
        // get aspect ratio
        const aspect = {
          width,
          height,
        };
        // get camera data
        const camera = JSON.parse(modelRunner.get_camera_data());
        // Call the server action with FormData
        const rows = (rowIds ? rowIds : []) as unknown as number[];
        // create the state
        // Create a Blob from the pixel data
        const blob = new Blob([new Uint8Array(pixels)], {type: 'image/png'});
        // Create FormData and append the blob
        const formData = new FormData();
        formData.append('file', blob, 'screenshot.png');
        // create the state
        const retval = await createState(formData, name, camera, project.id, aspect, rows);
        // apply it
        if (retval?.state) {
          applyState(retval?.state);
        }
        setIsSubmitting(false);
        setAddState(false);
      } catch (error) {
        console.log({error});
      }
    };
    // Register the event listener
    window.addEventListener('StateScreenshotTaken', handleNewState);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('StateScreenshotTaken', handleNewState);
    };
  }, [applyState, modelRunner, name, project.id, rowIds, setAddState, setIsSubmitting]);

  // screenshot
  useEffect(() => {
    const handleScreenshotTaken = async (event) => {
      try {
        const {pixels} = event.detail['ScreenShotTaken'];
        // Create a Blob from the pixel data
        const blob = new Blob([new Uint8Array(pixels)], {type: 'image/png'});
        // Use createImageBitmap to decode the image data into a bitmap
        const bitmap = await createImageBitmap(blob);
        // Create a canvas and draw the bitmap onto it
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = bitmap.width;
        tempCanvas.height = bitmap.height;
        const tempContext = tempCanvas.getContext('2d');
        tempContext?.drawImage(bitmap, 0, 0);
        // download the screenshot
        const dataUrl = tempCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'canvas-screenshot.png';
        link.click();
      } catch (error) {
        console.log({error});
      }
    };

    // Register the event listener
    window.addEventListener('ScreenshotTaken', handleScreenshotTaken);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('ScreenshotTaken', handleScreenshotTaken);
    };
  }, []);

  // selected glyphs
  useEffect(() => {
    const handleSelectedGlyphs = (event) => {
      const selectedGlyphs = event.detail['SelectedGlyphs'];
      // if empty, reset state
      if (!selectedGlyphs || selectedGlyphs?.length === 0) {
        setRowIds(false);
        setLastSelectedGlyph({});
        return;
      }

      // accumulate rowIds
      const rowIds = selectedGlyphs.flatMap((g) => g?.get('row_ids'));
      setRowIds(rowIds.length > 0 ? rowIds : false);

      // display latest
      const last = selectedGlyphs[selectedGlyphs.length - 1];
      const desc: Map<string, any> = last.get('desc');
      const glyphId: number = last.get('glyph_id');
      setLastSelectedGlyph({desc, glyphId});
    };

    // Register the event listener
    window.addEventListener('SelectedGlyphs', handleSelectedGlyphs);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('SelectedGlyphs', handleSelectedGlyphs);
    };
  }, [setLastSelectedGlyph, setRowIds]);

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
