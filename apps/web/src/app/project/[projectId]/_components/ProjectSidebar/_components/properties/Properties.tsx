'use client';
import React, {useCallback, useRef, useState} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {Property} from './Property';
import init, {ModelRunner} from '../../../../../../../../public/pkg/glyphx_cube_model';
import {
  doesStateExistSelector,
  drawerOpenAtom,
  modelDataAtom,
  modelRunnerAtom,
  payloadHashSelector,
  projectAtom,
  propertiesSelector,
  dataGridPayloadSelector,
} from 'state';
import {runGlyphEngineAction, updateProjectState} from 'actions';
import {webTypes} from 'types';

export const Properties = () => {
  const [modelRunnerState, setModelRunnerState] = useRecoilState(modelRunnerAtom);
  const [modelData, setModelData] = useRecoilState(modelDataAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const urlRef = useRef('');
  const payloadHash = useRecoilValue(payloadHashSelector);
  const doesStateExist = useRecoilValue(doesStateExistSelector);
  const {workspaceId, projectId, tableName} = useRecoilValue(dataGridPayloadSelector);
  const properties = useRecoilValue(propertiesSelector);
  const [isCollapsed, setCollapsed] = useState(false);
  const project = useRecoilValue(projectAtom);

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
      console.log('set modeRunner state');
      setModelRunnerState({initialized: true, modelRunner, lastPayloadHash: payloadHash});
      console.log('call modeRunner.run()');
      await modelRunner.run(1000, 1000);
    },
    [handleStream, payloadHash, processData, setDrawer, setModelRunnerState]
  );

  /* Initializes and manages the WebGL model on the canvas.
   * - Loads the WASM module and creates an instance of ModelRunner.
   * - Sets the modelRunner into the Recoil state for global access.
   */
  const runRustGlyphEngine = useCallback(
    async (event) => {
      event.stopPropagation();
      try {
        console.log('updating project state');
        await updateProjectState(project.id, project.state);
        // run Rust glyph engine to feed into ModelRunner
        console.log('running glyphengine');
        const retval = await runGlyphEngineAction(project);
        // TODO: need a discriminated union to remove @ts ignore comments
        // @ts-ignore
        if (retval && !retval?.error) {
          console.log('downloading model');
          // @ts-ignore
          await downloadModel(retval);
        }
        // }
      } catch (error) {
        console.log({error});
      }
    },
    [downloadModel, project]
  );

  return (
    properties && (
      <React.Fragment>
        <div className="group">
          <summary
            onClick={() => {
              setCollapsed(!isCollapsed);
            }}
            className="flex h-8 items-center cursor-pointer justify-between w-full text-gray hover:bg-secondary-midnight hover:border-b-white hover:text-white truncate border-b border-gray"
          >
            <div className="flex mx-2 items-center w-full">
              <span className="">
                {/* @JP Burford it's sinful but it's functional for now so*/}
                <svg
                  className={`w-5 h-5 ${isCollapsed ? '-rotate-90' : 'rotate-180'}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill="#CECECE"
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
                {' '}
                Axes{' '}
              </span>
            </div>
            <button
              onClick={runRustGlyphEngine}
              className={`flex items-center bg-gray hover:bg-yellow justify-around px-3 text-xs mr-2 my-2 text-center rounded disabled:opacity-75 text-white`}
            >
              <span>Apply</span>
            </button>
          </summary>
          {!isCollapsed && (
            <div className={`block border-b border-gray`}>
              <ul className="py-1 space-y-2">
                {Object.keys(properties)
                  .slice(0, 3)
                  .map((key) => (
                    <Property key={key} axis={key} />
                  ))}
              </ul>
            </div>
          )}
        </div>
      </React.Fragment>
    )
  );
};
