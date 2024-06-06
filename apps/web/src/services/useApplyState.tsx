'use client';
import {useCallback} from 'react';
import {useSession} from 'next-auth/react';
import {
  activeStateAtom,
  cameraAtom,
  drawerOpenAtom,
  imageHashAtom,
  modelRunnerAtom,
  payloadHashSelector,
  projectAtom,
  showLoadingAtom,
  splitPaneSizeAtom,
} from 'state';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {WritableDraft} from 'immer/dist/internal';
import produce from 'immer';
import {useUrl} from 'lib/client/hooks';
import {isNullCamera} from 'lib/utils/isNullCamera';
import {databaseTypes, webTypes} from 'types';
import {signDataUrls, signRustFiles} from 'actions';
import {callDownloadModel} from 'lib/client/network/reqs/callDownloadModel';
import init, {ModelRunner} from '../../public/pkg/glyphx_cube_model';
const useApplyState = () => {
  const session = useSession();
  const url = useUrl();
  const [modelRunnerState, setModelRunnerState] = useRecoilState(modelRunnerAtom);
  const payloadHash = useRecoilValue(payloadHashSelector);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const setCamera = useSetRecoilState(cameraAtom);
  const setImageHash = useSetRecoilState(imageHashAtom);
  const [project, setProject] = useRecoilState(projectAtom);
  const loading = useRecoilValue(showLoadingAtom);
  const [activeState, setActiveState] = useRecoilState(activeStateAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);

  const convertRowIds = (input: {[key: string]: number}[]) => {
    return input.map((obj) => Object.values(obj).join(''));
  };

  /**
   * Specialized buffer processor for vector stream
   * @param buffer
   * @returns
   */

  const processData = useCallback(
    (axis: webTypes.constants.AXIS, processor: string, modelRunner) => async (buffer: Buffer) => {
      let offset = 0;
      while (offset < buffer.length) {
        // Ensure the buffer is long enough to read the initial length value
        if (buffer.length < 8) {
          console.error('Buffer too short to read data length');
          return buffer; // Return the original buffer if it's too short
        }

        // Read the total length of the data from the first 8 bytes
        const totalDataLength = new DataView(buffer.buffer, buffer.byteOffset + offset, 8).getBigUint64(0, true);
        offset += 8;

        // Check if the full data specified by totalDataLength is available in the buffer
        if (offset + Number(totalDataLength) > buffer.length) {
          console.error('Not enough data in buffer');
          // using subarray to avoid copying the buffer
          return buffer.subarray(offset); // Return the buffer starting from the length value for reprocessing
        }

        // Extract the relevant data for processing
        const dataToProcess = buffer.subarray(offset, offset + Number(totalDataLength));

        switch (processor) {
          case 'vector':
            console.log(`Processing ${axis} vector data`, {modelRunner, dataToProcess});
            await modelRunner.add_vector(axis, dataToProcess);
            break;
          case 'stats':
            console.log('Processing stats data', {modelRunner, dataToProcess});
            const retval = await modelRunner.add_statistics(dataToProcess);
            console.log('stats', retval);
            break;
          case 'glyph':
            console.log('Processing glyph data', {modelRunner, dataToProcess});
            await modelRunner.add_glyph(dataToProcess);
            break;

          default:
            console.error('Unknown data type');
            break;
        }

        // Update the offset to move past the processed data
        offset += Number(totalDataLength);
        return buffer.subarray(offset); // Return the unprocessed remainder
      }
    },
    []
  );

  /**
   * Generic stream handler.
   * Provides continuity across chunks for data processData
   * @param url
   * @param processData
   */
  const handleStream = useCallback(async (url: string, processData) => {
    const response = await fetch(url);

    if (response.body) {
      const reader = response.body.getReader();
      let buffer = new Uint8Array();

      while (true) {
        const {done, value} = await reader.read();
        if (done && buffer.length === 0) break;

        if (value) {
          buffer = new Uint8Array([...buffer, ...value]);
        }

        // Call processData which is expected to process and modify buffer
        buffer = await processData(buffer);
      }

      // Handle any remaining buffer data
      if (buffer.length > 0) {
        console.error('Unhandled remaining data:', buffer);
      }
    }
  }, []);

  const downloadModel = useCallback(
    async (modelData: {GLY_URL: string; STS_URL: string; X_VEC: string; Y_VEC: string}) => {
      // Load the WASM module and create a new ModelRunner instance.
      // We can't re-use the model runner because there is no way to clear the stats and glyphs and reuse the event loop
      await init();
      console.log('WASM Loaded');
      const modelRunner = new ModelRunner();
      console.log('ModelRunner created');
      const {GLY_URL, STS_URL, X_VEC, Y_VEC} = modelData;
      // First, handle statistics and vectors concurrently
      // @ts-ignore
      urlRef.current = GLY_URL;
      // @ts-ignore
      await handleStream(STS_URL, processData(undefined, 'stats', modelRunner));
      // @ts-ignore
      await handleStream(X_VEC, processData('x', 'vector', modelRunner));
      // @ts-ignore
      await handleStream(Y_VEC, processData('y', 'vector', modelRunner));
      // @ts-ignore
      await handleStream(GLY_URL, processData(undefined, 'glyph', modelRunner));

      // creates a new state inside the model
      // run can only instantiate one event loop per thread
      console.log('set lastPayloadHash');
      console.log('set resize');
      console.log('set drawer');
      setDrawer(true);
      // const width = canvasParent!.clientWidth;
      // const height = canvasParent!.clientHeight;
      setModelRunnerState({initialized: true, modelRunner, lastPayloadHash: payloadHash});
      await modelRunner.run();
    },
    [handleStream, payloadHash, processData, setDrawer, setModelRunnerState]
  );

  const applyState = useCallback(
    async (idx: number, newProject: any) => {
      if (activeState === idx) {
        setActiveState(-1);
        return;
      }
      setActiveState(idx);
      setDrawer(true);

      // only apply state if not loading
      if (!(Object.keys(loading).length > 0)) {
        const filteredStates = newProject
          ? newProject.stateHistory?.filter((state) => !state.deletedAt)
          : project.stateHistory.filter((state) => !state.deletedAt);

        const state = filteredStates[idx];
        const payloadHash = state.payloadHash;
        const properties = state.properties;
        const camera = state.camera;
        const ids = state.rowIds ?? [];
        const rowIds = convertRowIds(ids);

        const signedUrls = await signRustFiles(project?.workspace.id, project?.id, payloadHash);

        const aspect = state.aspectRatio.width / state.aspectRatio.height;
        if (signedUrls) {
          await downloadModel(signedUrls);
          modelRunnerState.modelRunner.set_camera_data(camera, aspect);
          // replace project state
          setProject(
            produce((draft: any) => {
              // set axes and filters
              draft.state.properties = properties;
              draft.stateHistory = filteredStates;
            })
          );
        } else {
          setLoading(
            produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
              draft.processName = 'Failed to Open State Snapshot';
              draft.processStatus = databaseTypes.constants.PROCESS_STATUS.FAILED;
              draft.processEndTime = new Date();
            })
          );
          setActiveState(-1);
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loading, project, session, setActiveState, setDrawer, setLoading, setResize, url, activeState]
  );

  return {applyState};
};

export default useApplyState;
