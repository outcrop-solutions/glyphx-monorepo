'use client';
import {useCallback, useEffect, useRef, useState} from 'react';
import {useDebounceCallback} from 'usehooks-ts';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {
  lastSelectedGlyphAtom,
  rowIdsAtom,
  activeStateNameAtom,
  isSubmittingAtom,
  showStateInputAtom,
  modelRunnerAtom,
  lastStateSelector,
  sceneRenderedAtom,
  projectAtom,
  docAtom,
} from 'state';
// hooks
import {useWindowSize} from './useWindowSize';
import {useRust} from './useRust';
// actions
import {createState} from 'actions';

export const useInitialize = (project, doc) => {
  // refs
  const projectViewRef = useRef(null);
  const hasRendered = useRef(false);
  // local state
  const [isCreatingState, setIsCreatingState] = useState(false);
  // recoil
  const name = useRecoilValue(activeStateNameAtom);
  const rowIds = useRecoilValue(rowIdsAtom);
  const modelRunner = useRecoilValue(modelRunnerAtom);
  const lastState = useRecoilValue(lastStateSelector);
  const setRowIds = useSetRecoilState(rowIdsAtom);
  const setLastSelectedGlyph = useSetRecoilState(lastSelectedGlyphAtom);
  const setAddState = useSetRecoilState(showStateInputAtom);
  const setIsSubmitting = useSetRecoilState(isSubmittingAtom);

  // custom hooks
  const {applyState} = useRust();

  // resize setup
  useWindowSize();

  /**
   * Open the last state
   */
  const openLastState = useCallback(async () => {
    console.log('opening last state', {lastState});
    if (lastState) {
      await applyState(lastState);
    }
  }, [applyState, lastState]);
  useEffect(() => {
    openLastState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * REGISTER CREATE STATE LISTENER
   */
  const handleNewState = useCallback(
    async (event) => {
      try {
        const {width, height, pixels} = event.detail['ScreenShotTaken'];
        // get aspect ratio
        const aspect = {
          width,
          height,
        };
        // get camera data
        const camera = JSON.parse(modelRunner?.get_camera_data());
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
        console.log({retval});
        // apply it
        if (retval?.state) {
          console.log('applying state retval', {retval});
          applyState(retval?.state);
        }
        setIsSubmitting(false);
        setAddState(false);
      } catch (error) {
        console.log({error});
      }
      setIsCreatingState(false);
    },
    [modelRunner, createState, project]
  );
  useEffect(() => {
    window.addEventListener('StateScreenshotTaken', handleNewState);
    return () => {
      window.removeEventListener('StateScreenshotTaken', handleNewState);
    };
  }, [handleNewState]);

  /**
   * REGISTER GE STATE CREATE LISTENER
   */
  const cb = useCallback(
    async (event) => {
      try {
        if (hasRendered.current) return; // Prevent re-entry
        hasRendered.current = true;
        modelRunner.take_screenshot(true);
      } catch (error) {
        console.log({error});
      }
    },
    [hasRendered]
  );
  const handleSceneRendered = useDebounceCallback(cb, 1000);
  useEffect(() => {
    window.addEventListener('SceneRendered', handleSceneRendered);
    return () => {
      window.removeEventListener('SceneRendered', handleSceneRendered);
    };
  }, [handleSceneRendered]);

  /**
   * REGISTER SCREENSHOT LISTENER
   */
  const handleScreenshotTaken = useCallback(async (event) => {
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
  }, []);
  useEffect(() => {
    window.addEventListener('ScreenshotTaken', handleScreenshotTaken);
    return () => {
      window.removeEventListener('ScreenshotTaken', handleScreenshotTaken);
    };
  }, [handleScreenshotTaken]);

  /**
   * REGISTER SELECTED GLYPH LISTENER
   */
  const handleSelectedGlyphs = useCallback(
    (event) => {
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
    },
    [setRowIds, setLastSelectedGlyph]
  );
  useEffect(() => {
    window.addEventListener('SelectedGlyphs', handleSelectedGlyphs);
    return () => {
      window.removeEventListener('SelectedGlyphs', handleSelectedGlyphs);
    };
  }, [handleSelectedGlyphs]);

  return {doc, project, projectViewRef};
};
