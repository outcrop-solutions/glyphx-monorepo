'use client';
import React, {useCallback, useRef, useState} from 'react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {Property} from './Property';
import {
  dataGridPayloadSelector,
  doesStateExistSelector,
  drawerOpenAtom,
  modelRunnerAtom,
  projectAtom,
  projectSegmentAtom,
  propertiesSelector,
  showLoadingAtom,
  splitPaneSizeAtom,
} from 'state';
import {useSession} from 'next-auth/react';
import {useSWRConfig} from 'swr';
import {callCreateModel} from 'lib/client/network/reqs/callCreateModel';
import toast from 'react-hot-toast';
import {hashPayload, hashFileSystem} from 'business/src/util/hashFunctions';
import {useUrl} from 'lib/client/hooks';
import {isValidPayload} from 'lib/utils/isValidPayload';
import {callDownloadModel} from 'lib/client/network/reqs/callDownloadModel';
import {runGlyphEngineAction, updateProjectState} from 'actions';
import {useFeatureIsOn} from '@growthbook/growthbook-react';
import {webTypes} from 'types';

export const Properties = () => {
  const session = useSession();
  const {mutate} = useSWRConfig();
  const {modelRunner} = useRecoilValue(modelRunnerAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);
  const setLoading = useSetRecoilState(showLoadingAtom);
  const urlRef = useRef('');
  const doesStateExist = useRecoilValue(doesStateExistSelector);
  const {workspaceId, projectId, tableName} = useRecoilValue(dataGridPayloadSelector);

  // used to condition the call to rust glyphengine
  const isWebGPUEnabled = useFeatureIsOn('webgpu');
  const segment = useRecoilValue(projectSegmentAtom);

  const url = useUrl();
  const properties = useRecoilValue(propertiesSelector);
  const [isCollapsed, setCollapsed] = useState(false);
  const project = useRecoilValue(projectAtom);

  const handleApply = useCallback(
    async (event: any) => {
      //Our apply button is wrapped in the summary element, and the click handler is bubbling up. so we need to stop propagation.  This will keep our axes control in the open state when pressing apply.
      event.stopPropagation();
      // project already contains filter state, no deepMerge necessary
      const payloadHash = hashPayload(hashFileSystem(project.files), project);

      if (!isValidPayload(properties)) {
        toast.success('Generate a model before applying filters!');
      } else if (doesStateExist) {
        await updateProjectState(project.id, project.state);
        await callDownloadModel({
          project,
          payloadHash,
          session,
          url,
          setLoading,
          setDrawer,
          setResize,
        });
      } else {
        await callCreateModel({
          isFilter: true,
          project,
          payloadHash,
          session,
          url,
          setLoading,
          setDrawer,
          setResize,
          mutate,
        });
      }
      setLoading({});
    },
    [doesStateExist, mutate, project, properties, session, setDrawer, setLoading, setResize, url]
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
          return buffer.subarray(0, 8); // Return the buffer starting from the length value for reprocessing
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
    [modelRunner]
  );

  const runRustGlyphEngine = useCallback(
    async (event) => {
      event.stopPropagation();
      // set initial loading state
      // setLoading(
      //   produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
      //     draft.processName = 'Generating Data Model...';
      //     draft.processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
      //     draft.processStartTime = new Date();
      //   })
      // );
      try {
        // run glyph engine
        const retval = await runGlyphEngineAction(project, properties);

        // TODO: need a discriminated union to remove @ts ignore comments
        // @ts-ignore
        if (retval && !retval?.error) {
          // First, handle statistics and vectors concurrently
          // process stats and vectors before glyphs
          // await Promise.all([
          // @ts-ignore
          urlRef.current = retval.GLY_URL;
          // @ts-ignore
          await handleStream(retval?.STS_URL, processData(undefined, 'stats'));

          // @ts-ignore
          await handleStream(retval?.X_VEC, processData('x', 'vector'));
          // @ts-ignore
          await handleStream(retval?.Y_VEC, processData('y', 'vector'));
          // ]);
          // setTimeout(async () => {
          //   try {
          // @ts-ignore
          // await handleStream(retval?.GLY_URL, processData(undefined, 'glyph'));
          //   } catch (error) {
          //     console.log({error});
          //   }
          // }, 2000);

          // setTimeout(async () => {
          // try {
          //   await modelRunner.run();
          // } catch (error) {
          //   console.log('model run error', {error});
          // }
          // }, 5000);
        }

        //

        // load glyphs
      } catch (error) {
        console.log({error});
      }
    },

    [handleStream, processData, project, properties]
    // [modelRunner, project, properties, setLoading]
  );

  const streamGlyph = useCallback(async () => {
    try {
      const x_vec_count = modelRunner.get_x_vector_count();
      const y_vec_count = modelRunner.get_y_vector_count();
      const stats_count = modelRunner.get_stats_count();
      const glyph_count = modelRunner.get_glyph_count();
      console.log({
        x_vec_count,
        y_vec_count,
        stats_count,
        glyph_count,
      });
      // @ts-ignore
      await handleStream(urlRef.current, processData(undefined, 'glyph'));
    } catch (error) {
      console.log({error});
    }
  }, [handleStream, modelRunner, processData]);

  const modelRun = useCallback(async () => {
    try {
      await modelRunner.run();
      // } catch (error) {
      //   console.log('model run error', {error});
      // }
    } catch (error) {
      console.log({error});
    }
  }, [modelRunner]);

  const runRust = isWebGPUEnabled && segment === 'CONFIG';

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
              onClick={runRust ? runRustGlyphEngine : handleApply}
              className={`flex items-center bg-gray hover:bg-yellow justify-around px-3 text-xs mr-2 my-2 text-center rounded disabled:opacity-75 text-white`}
            >
              <span>Apply</span>
            </button>
            <button
              onClick={streamGlyph}
              className={`flex items-center bg-gray hover:bg-yellow justify-around px-3 text-xs mr-2 my-2 text-center rounded disabled:opacity-75 text-white`}
            >
              <span>stream</span>
            </button>
            <button
              onClick={modelRun}
              className={`flex items-center bg-gray hover:bg-yellow justify-around px-3 text-xs mr-2 my-2 text-center rounded disabled:opacity-75 text-white`}
            >
              <span>run</span>
            </button>
            {/* <PlusIcon className="w-5 h-5 opacity-75 mr-1" /> */}
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
