'use client';
import React, {useCallback, useEffect, useState} from 'react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {MainDropzone} from '../ProjectSidebar/_components/files';
import {Datagrid} from './DataGrid';
import {GridHeader} from './GridHeader';
import {ModelFooter} from './ModelFooter';
import {filesOpenSelector} from 'state/files';
import {modelRunnerAtom, orientationAtom, splitPaneSizeAtom, windowSizeAtom} from 'state';
import SplitPane from 'react-split-pane';
import {Model} from '../Model';
import {CameraIcon, HomeIcon, RefreshIcon} from '@heroicons/react/outline';
import {Move3D} from 'lucide-react';
import {screenshotModel} from '../Model/utils';
import {debounce} from 'lodash';

export const GridContainer = () => {
  // ensures we don't pre-render the server
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const modelRunnerState = useRecoilValue(modelRunnerAtom);
  const openFiles = useRecoilValue(filesOpenSelector);
  const orientation = useRecoilValue(orientationAtom);
  const {height} = useRecoilValue(windowSizeAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);

  const debouncedOnChange = debounce((data) => {
    setResize(data);
  }, 50);

  const handlePaneResize = useCallback(
    (size) => {
      debouncedOnChange(size);
    },
    [debouncedOnChange]
  );

  const getPaneHeight = () => {
    if (height) {
      if (orientation === 'vertical') {
        return height - 60;
      } else {
        return height - 70;
      }
    }
  };

  return (
    isClient && (
      <div className="relative h-full w-full border-r border-gray">
        <ModelFooter />
        {/* @ts-ignore */}
        <SplitPane
          style={{overflow: 'scroll', height: `${getPaneHeight()}px`}}
          split={orientation}
          allowResize={true}
          defaultSize={100}
          maxSize={7000}
          minSize={70}
          onChange={handlePaneResize}
          primary={'first'}
        >
          <div className="flex flex-col w-full h-full">
            {openFiles?.length > 0 ? (
              <>
                <GridHeader />
                <Datagrid />
              </>
            ) : (
              <MainDropzone />
            )}
          </div>

          <div className="h-full w-full relative">
            <div className="absolute left-2 top-12 flex-col items-center space-y-2 z-[9999] pt-2">
              <div
                onClick={() => modelRunnerState.modelRunner.reset_camera()}
                className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
              >
                <HomeIcon className="h-5 w-5" />
              </div>
              <div
                onClick={() => modelRunnerState.modelRunner.toggle_axis_lines()}
                className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
              >
                <Move3D className="h-5 w-5" />
              </div>
              <div
                onClick={screenshotModel}
                className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
              >
                <CameraIcon className="h-5 w-5" />
              </div>
              <div
                onClick={() => modelRunnerState.modelRunner.run()}
                className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
              >
                <RefreshIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 top-12 flex items-center justify-between space-x-2 z-[9999] pt-2">
              <div
                onClick={() => modelRunnerState.modelRunner.focus_on_x_axis()}
                className="hover:bg-gray bg-secondary-blue rounded-full p-1 h-8 w-8"
              >
                <div className="text-center text-sm">X</div>
              </div>
              <div
                onClick={() => modelRunnerState.modelRunner.focus_on_z_axis()}
                className="hover:bg-gray bg-secondary-blue rounded-full p-1 h-8 w-8"
              >
                <div className="text-center text-sm">T</div>
              </div>
              <div
                onClick={() => modelRunnerState.modelRunner.focus_on_y_axis()}
                className="hover:bg-gray bg-secondary-blue rounded-full p-1 h-8 w-8"
              >
                <div className="text-center text-sm">Y</div>
              </div>
            </div>
            <Model />
          </div>
        </SplitPane>
      </div>
    )
  );
};
