import {useCallback, useRef} from 'react';
import {webTypes} from 'types';
import init, {ModelRunner} from '../../public/pkg/glyphx_cube_model';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {drawerOpenAtom, modelRunnerAtom, payloadHashSelector, projectAtom} from 'state';
import {runGlyphEngineAction, updateProjectState} from 'actions';

export const useRust = () => {
  const setModelRunnerState = useSetRecoilState(modelRunnerAtom);
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
    (axis: webTypes.constants.AXIS, processor: string, modelRunner) => async (buffer: Buffer) => {
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
            console.log(`Processing ${axis} vector data`, {modelRunner, dataToProcess});
            await modelRunner.add_vector(axis.toLowerCase(), dataToProcess);
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

  const downloadModel = useCallback(
    async (modelData: {GLY_URL: string; STS_URL: string; X_VEC: string; Y_VEC: string}) => {
      try {
        // Load the WASM module and create a new ModelRunner instance.
        // We can't re-use the model runner because there is no way to clear the stats and glyphs and reuse the event loop
        await init().catch((error) => {
          console.log('catching error', {error});
          // if (!error.message.startsWith('Using exceptions for control flow,')) {
          //   throw error;
          // }
        });
        console.log('WASM Loaded');
        const modelRunner = new ModelRunner();
        console.log('ModelRunner created');
        const {GLY_URL, STS_URL, X_VEC, Y_VEC} = modelData;
        // First, handle statistics and vectors concurrently
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

        const canvas = document.getElementById('glyphx-cube-model');
        if (!canvas) {
          console.log('Canvas not found');
          return;
        }
        const width = canvas!.clientWidth;
        const height = canvas!.clientHeight;
        console.log('Canvas obtained in useRust', {canvas, width, height});

        console.log('set modeRunner state');
        setModelRunnerState({initialized: true, modelRunner, lastPayloadHash: payloadHash});
        console.log('call modeRunner.run()');
        // const h = height - 44;
        await modelRunner.run(width / 2, height / 2);
      } catch (error) {
        console.log('swallowedError', {error});
      }
    },
    [handleStream, payloadHash, processData, setDrawer, setModelRunnerState]
  );

  /* Initializes and manages the WebGL model on the canvas.
   * - Loads the WASM module and creates an instance of ModelRunner.
   * - Sets the modelRunner into the Recoil state for global access.
   */
  const runRustGlyphEngine = useCallback(
    async (event) => {
      event?.stopPropagation();
      try {
        if (project) {
          await updateProjectState(project.id, project.state);
          // console.log('updated project state');
          const retval = await runGlyphEngineAction(project);
          // console.log('ran glyph engine');
          // @ts-ignore
          if (retval && !retval?.error) {
            // @ts-ignore
            await downloadModel(retval);
          }
        }
      } catch (error) {
        console.log({error});
      }
    },
    [downloadModel, project]
  );

  const downloadState = useCallback(
    async (stateId: string) => {
      try {
        if (project) {
          await updateProjectState(project.id, project.state);
          const retval = await runGlyphEngineAction(project, stateId);
          // @ts-ignore
          if (retval && !retval?.error) {
            // @ts-ignore
            await downloadModel(retval);
          }
        }
      } catch (error) {
        console.log({error});
      }
    },
    [downloadModel, project]
  );

  return {
    downloadState,
    runRustGlyphEngine,
  };
};
