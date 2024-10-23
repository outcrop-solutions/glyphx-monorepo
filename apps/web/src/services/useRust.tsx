import {useCallback, useEffect, useRef} from 'react';
import {databaseTypes, webTypes} from 'types';
import init, {ModelRunner} from '../../public/pkg/glyphx_cube_model';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {drawerOpenAtom, geLoadingAtom, modelRunnerAtom, payloadHashSelector, projectAtom, showLoadingAtom} from 'state';
import {runGlyphEngineAction, updateProjectState} from 'actions';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';

export const useRust = () => {
  const [{initialized, modelRunner, lastPayloadHash}, setModelRunnerState] = useRecoilState(modelRunnerAtom);
  const setGELoading = useSetRecoilState(geLoadingAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const project = useRecoilValue(projectAtom);
  const payloadHash = useRecoilValue(payloadHashSelector);
  const urlRef = useRef('');

  // Initialize the models
  useEffect(() => {
    const initModel = async () => {
      if (!initialized) {
        console.log('WASM Loaded');
        await init();
        console.log('ModelRunner created');
        const modelRunner = new ModelRunner();
        console.log('ModelRunner state set', {initialized: true, modelRunner, lastPayloadHash: payloadHash});
        setModelRunnerState({initialized: true, modelRunner, lastPayloadHash: payloadHash});
      }
    };
    initModel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          // console.error('Buffer too short to read data length');
          return buffer; // Return the original buffer if it's too short
        }

        // Read the total length of the data from the first 8 bytes
        const totalDataLength = new DataView(buffer.buffer, buffer.byteOffset + offset, 8).getBigUint64(0, true);
        offset += 8;

        // Check if the full data specified by totalDataLength is available in the buffer
        if (offset + Number(totalDataLength) > buffer.length) {
          // console.error('Not enough data in buffer');
          // using subarray to avoid copying the buffer
          return buffer.subarray(offset); // Return the buffer starting from the length value for reprocessing
        }
        // Extract the relevant data for processing
        const dataToProcess = buffer.subarray(offset, offset + Number(totalDataLength));

        switch (processor) {
          case 'vector':
            console.log(`Processing ${axis} vector data`, {dataToProcess});
            await modelRunner.add_vector(axis.toLowerCase(), dataToProcess);
            break;
          case 'stats':
            console.log('Processing stats data', {dataToProcess});
            const retval = await modelRunner.add_statistics(dataToProcess);
            console.log('stats', retval);
            break;
          case 'glyph':
            console.log('Processing glyph data', {dataToProcess});
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

        if (initialized && lastPayloadHash) {
          modelRunner.reset_state();
          return;
        }

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
        setModelRunnerState(
          produce((draft: WritableDraft<any>) => {
            draft.lastPayloadHash = payloadHash;
          })
        );
        console.log('model run()');
        await modelRunner.run(width, height);
      } catch (error) {
        console.log('swallowedError', {error});
      }
    },
    [handleStream, initialized, lastPayloadHash, modelRunner, payloadHash, processData, setDrawer, setModelRunnerState]
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
        if (initialized && lastPayloadHash) {
          modelRunner.clear_data();
        }
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
    [downloadModel, initialized, lastPayloadHash, modelRunner, project, setGELoading]
  );

  const downloadState = useCallback(
    async (stateId: string) => {
      try {
        // set loading
        setGELoading(true);
        // if model is already loaded
        if (initialized && lastPayloadHash) {
          modelRunner.clear_data();
        }
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
    [downloadModel, initialized, lastPayloadHash, modelRunner, project, setGELoading]
  );

  return {
    downloadState,
    runRustGlyphEngine,
  };
};
