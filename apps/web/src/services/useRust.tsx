import {useCallback, useRef} from 'react';
import {webTypes} from 'types';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {drawerOpenAtom, geLoadingAtom, modelRunnerSelector, payloadHashSelector, projectAtom} from 'state';
import {runGlyphEngineAction, updateProjectState} from 'actions';

export const useRust = () => {
  const modelRunner = useRecoilValue(modelRunnerSelector);
  const setGELoading = useSetRecoilState(geLoadingAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const project = useRecoilValue(projectAtom);
  const payloadHash = useRecoilValue(payloadHashSelector);
  const urlRef = useRef('');

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

  /**
   * Specialized buffer processor for vector stream
   * @param buffer
   * @returns
   */
  const processData = useCallback(
    (axis: webTypes.constants.AXIS, processor: string) => async (buffer: Buffer) => {
      let offset = 0;
      while (offset < buffer.length) {
        // Ensure the buffer is long enough to read the initial length value
        if (buffer.length < 8) {
          return buffer; // Return the original buffer if it's too short
        }
        // Read the total length of the data from the first 8 bytes
        const totalDataLength = new DataView(buffer.buffer, buffer.byteOffset + offset, 8).getBigUint64(0, true);
        offset += 8;
        // Check if the full data specified by totalDataLength is available in the buffer
        if (offset + Number(totalDataLength) > buffer.length) {
          // using subarray to avoid copying the buffer
          return buffer.subarray(offset); // Return the buffer starting from the length value for reprocessing
        }
        // Extract the relevant data for processing
        const dataToProcess = buffer.subarray(offset, offset + Number(totalDataLength));
        switch (processor) {
          case 'vector':
            console.log(`Processing ${axis} vector data`, {dataToProcess});
            // @ts-ignore
            modelRunner.add_vector(axis.toLowerCase(), dataToProcess);
            break;
          case 'stats':
            console.log('Processing stats data', {dataToProcess});
            // @ts-ignore
            const retval = modelRunner.add_statistics(dataToProcess);
            console.log('stats', retval);
            break;
          case 'glyph':
            console.log('Processing glyph data', {dataToProcess});
            // @ts-ignore
            modelRunner.add_glyph(dataToProcess);
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
    [modelRunner]
  );

  /**
   * Sets up the streams and processes the data
   * Runs the modelRunner.run() call
   */
  const downloadModel = useCallback(
    async (modelData: {GLY_URL: string; STS_URL: string; X_VEC: string; Y_VEC: string}) => {
      try {
        // Load the WASM module and create a new ModelRunner instance.
        // We can't re-use the model runner because there is no way to clear the stats and glyphs and reuse the event loop
        const {GLY_URL, STS_URL, X_VEC, Y_VEC} = modelData;
        // First, handle statistics and vectors concurrently
        urlRef.current = GLY_URL;
        // @ts-ignore
        await handleStream(STS_URL, processData(undefined, 'stats'));
        // @ts-ignore
        await handleStream(X_VEC, processData('x', 'vector'));
        // @ts-ignore
        await handleStream(Y_VEC, processData('y', 'vector'));
        // @ts-ignore
        await handleStream(GLY_URL, processData(undefined, 'glyph'));

        // if (lastPayloadHash) {
        //   modelRunner.reset_state();
        //   return;
        // }

        setDrawer(true);
        const canvas = document.getElementById('glyphx-cube-model');
        if (!canvas) {
          console.log('Canvas not found');
          return;
        }
        const width = canvas!.clientWidth;
        const height = canvas!.clientHeight;
        /**
         *  This affects this
         * if (initialized && lastPayloadHash) {
         *    modelRunner.clear_data();
         * }
         */
        // setModelRunnerState(
        //   produce((draft: WritableDraft<any>) => {
        //     draft.lastPayloadHash = payloadHash;
        //   })
        // );
        await modelRunner.run(width, height);
      } catch (error) {
        console.log('swallowedError', {error});
      }
    },
    [handleStream, modelRunner, processData, setDrawer]
  );

  /* Initializes and manages the WebGL model on the canvas.
   * - Loads the WASM module and creates an instance of ModelRunner.
   * - Sets the modelRunner into the Recoil state for global access.
   */
  const runRustGlyphEngine = useCallback(
    async (event) => {
      event?.stopPropagation();
      try {
        // set loading
        setGELoading(true);
        // if model is already loaded
        // if (lastPayloadHash) {
        modelRunner.clear_data();
        // }
        // run the action
        if (project) {
          // update DB
          await updateProjectState(project.id, project.state);
          // run GE
          const retval = await runGlyphEngineAction(project);
          // @ts-ignore
          if (retval && !retval?.error) {
            // @ts-ignore
            await downloadModel(retval);
          }
        }
        setGELoading(false);
      } catch (error) {
        setGELoading(false);
        console.log({error});
      }
    },
    [downloadModel, modelRunner, project, setGELoading]
  );

  /**
   * Same as runRustGLyphEngine
   */
  const downloadState = useCallback(
    async (stateId: string) => {
      try {
        // set loading
        setGELoading(true);
        // if model is already loaded
        // if (initialized && lastPayloadHash) {
        modelRunner.clear_data();
        // }
        if (project) {
          await updateProjectState(project.id, project.state);
          const retval = await runGlyphEngineAction(project, stateId);
          // @ts-ignore
          if (retval && !retval?.error) {
            // @ts-ignore
            await downloadModel(retval);
          }
        }
        setGELoading(false);
      } catch (error) {
        setGELoading(false);
        console.log({error});
      }
    },
    [downloadModel, modelRunner, project, setGELoading]
  );

  return {
    downloadState,
    runRustGlyphEngine,
  };
};
