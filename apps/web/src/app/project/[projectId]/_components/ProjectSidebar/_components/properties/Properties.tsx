'use client';
import React, {useCallback, useState} from 'react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {Property} from './Property';
import {
  dataGridPayloadSelector,
  doesStateExistSelector,
  drawerOpenAtom,
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
import {buildRustPayload, getFieldType, runGlyphEngine, runGlyphEngineAction, updateProjectState} from 'actions';
import {useFeatureIsOn} from '@growthbook/growthbook-react';
import {databaseTypes, fileIngestionTypes, glyphEngineTypes, rustGlyphEngineTypes, webTypes} from 'types';
import {FieldDataType} from 'types/src/rustGlyphEngine/constants';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';

export const Properties = () => {
  const session = useSession();
  const {mutate} = useSWRConfig();
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

  const runRustGlyphEngine = useCallback(
    async (event) => {
      event.stopPropagation();
      // set initial loading state
      setLoading(
        produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
          draft.processName = 'Generating Data Model...';
          draft.processStatus = databaseTypes.constants.PROCESS_STATUS.IN_PROGRESS;
          draft.processStartTime = new Date();
        })
      );
      try {
        // run glyph engine
        const result = await runGlyphEngineAction(project, properties);
        console.log({result});
      } catch (error) {
        console.log({error});
      }
      // if (!result?.error) {
      //   setLoading(
      //     produce((draft: WritableDraft<Partial<Omit<databaseTypes.IProcessTracking, '_id'>>>) => {
      //       draft.processName = 'Fetching Data...';
      //     })
      //   );
      // }
    },
    [project, properties, setLoading]
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
