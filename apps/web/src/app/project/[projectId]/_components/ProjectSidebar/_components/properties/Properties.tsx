'use client';
import React, {useCallback, useState} from 'react';
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
        if (done) break;

        buffer = new Uint8Array([...buffer, ...value]);

        // Call processData which is expected to process and modify buffer
        buffer = processData(buffer);
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
  const processVectorData = useCallback(
    (axis: webTypes.constants.AXIS) => (buffer) => {
      let offset = 0;

      while (offset < buffer.length) {
        if (offset + 1 > buffer.length) break; // Ensure there's enough buffer to read the discriminator

        const discriminator = buffer[offset]; // Read the enum variant discriminator
        offset += 1; // Move past the discriminator

        let origValueLength = 0;

        switch (discriminator) {
          case 0: // String
            if (offset + 4 > buffer.length) return buffer.slice(offset - 1); // Not enough buffer to read the length
            const stringLength = new DataView(buffer.buffer, buffer.byteOffset + offset).getUint32(0, true);
            origValueLength = 4 + stringLength; // Length field plus string data
            break;
          case 1: // F64
          case 2: // U64
            origValueLength = 8; // Direct 8 bytes for f64 or u64
            break;
          case 3: // Empty
            origValueLength = 0; // No additional bytes
            break;
          default:
            console.error('Unknown discriminator value');
            return buffer.slice(offset - 1); // Revert to before discriminator if unknown
        }

        offset += origValueLength;

        if (offset + 16 > buffer.length) break; // Ensure there's enough buffer to read vector and rank

        const vectorData = buffer.slice(offset - origValueLength - 1, offset + 16);
        console.log({vectorData});
        modelRunner.addVector(axis, Array.from(vectorData));
        offset += 16; // Move past vector and rank data
      }

      return buffer.slice(offset); // Return the unprocessed remainder
    },
    [modelRunner]
  );

  /**
   * Parses and streams statistics binary data
   * @param buffer
   * @returns
   */
  const processStatsData = useCallback(
    (buffer) => {
      let offset = 0;

      while (offset < buffer.length) {
        // Read the length of the axis string
        if (offset + 4 > buffer.length) break; // Ensure there's enough buffer to read the length
        const axisLength = new DataView(buffer.buffer, buffer.byteOffset + offset).getUint32(0, true);
        offset += 4;

        // Check if the whole axis string is available in the buffer
        if (offset + axisLength + 8 * 32 + 8 > buffer.length) break; // Ensure all data after the axis is available

        // Extract the axis string
        const axis = new TextDecoder('utf-8').decode(buffer.slice(offset, offset + axisLength));
        offset += axisLength;

        // Extract all floating point values and the max_rank
        const statsValues = new Float64Array(
          buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + 8 * 32)
        );
        offset += 8 * 32;

        // Extract max_rank
        const maxRank = new DataView(buffer.buffer, buffer.byteOffset + offset).getUint32(0, true);
        offset += 8;

        console.log('Parsed Stats:', {axis, statsValues, maxRank});
        modelRunner.add_statstics(Array.from(new Uint8Array(buffer.slice(offset - (axisLength + 8 * 32 + 8), offset))));
      }

      return buffer.slice(offset); // Return the unprocessed remainder for further processing
    },
    [modelRunner]
  );

  /**
   * Parses and streams glyph data
   * @param buffer
   * @returns
   */
  const processGlyphData = useCallback(
    (buffer) => {
      let offset = 0;

      while (offset < buffer.length) {
        // Ensure there's enough buffer to read the three f64 values and the length of the vector
        if (offset + 24 + 8 > buffer.length) break;

        // Read three f64 values
        const xValue = new DataView(buffer.buffer, buffer.byteOffset + offset).getFloat64(0, true);
        const yValue = new DataView(buffer.buffer, buffer.byteOffset + offset + 8).getFloat64(0, true);
        const zValue = new DataView(buffer.buffer, buffer.byteOffset + offset + 16).getFloat64(0, true);
        offset += 24;

        // Read the length of the vector
        const numRowIds = new DataView(buffer.buffer, buffer.byteOffset + offset).getUint32(0, true);
        offset += 8;

        // Check if the whole row_ids array is available in the buffer
        if (offset + numRowIds * 8 > buffer.length) break;

        // Extract the row_ids
        const rowIds = new Uint32Array(
          buffer.buffer.slice(buffer.byteOffset + offset, buffer.byteOffset + offset + numRowIds * 8)
        );
        offset += numRowIds * 8;

        console.log('Parsed Glyph:', {xValue, yValue, zValue, rowIds});

        const glyphData = new Uint8Array(buffer.slice(offset - (24 + 8 + numRowIds * 8), offset));
        modelRunner.add_glyph(Array.from(glyphData));
      }

      return buffer.slice(offset); // Return the unprocessed remainder for further processing
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
          await Promise.all([
            // @ts-ignore
            handleStream(retval?.STS_URL, processStatsData),
            // @ts-ignore
            handleStream(retval?.X_VEC, processVectorData('x')),
            // @ts-ignore
            handleStream(retval?.Y_VEC, processVectorData('y')),
          ]);
          // @ts-ignore
          await handleStream(retval?.GLY_URL, processGlyphData);
        }

        // load glyphs
      } catch (error) {
        console.log({error});
      }
    },
    [handleStream, processGlyphData, processVectorData, project, properties]
    // [modelRunner, project, properties, setLoading]
  );

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
                {/* @jp-burford it's sinful but it's functional for now so*/}
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
