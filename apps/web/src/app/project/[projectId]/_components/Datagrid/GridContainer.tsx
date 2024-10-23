'use client';
import React, {useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {MainDropzone} from '../ProjectSidebar/_components/files';
import {Datagrid} from './DataGrid';
import {GridHeader} from './GridHeader';
import {ModelFooter} from './ModelFooter';
import {filesOpenSelector} from 'state/files';
import {geLoadingAtom, modelRunnerAtom, orientationAtom, splitPaneSizeAtom, windowSizeAtom} from 'state';
import SplitPane from 'react-split-pane';
import {Model} from '../Model';
import {ModelControls} from './ModelControls';
import {useDebounceCallback} from 'usehooks-ts';
import LoadingBar from 'app/_components/Loaders/LoadingBar';

export const GridContainer = () => {
  const modelRunnerState = useRecoilValue(modelRunnerAtom);
  const isGERunning = useRecoilValue(geLoadingAtom);
  // ensures we don't pre-render the server
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const openFiles = useRecoilValue(filesOpenSelector);
  const orientation = useRecoilValue(orientationAtom);
  const {height} = useRecoilValue(windowSizeAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);

  const handlePaneResize = useDebounceCallback((size) => {
    // resize event based on drag
    const pane = document.getElementsByClassName('SplitPane');
    if (modelRunnerState.initialized) {
      if (orientation === 'horizontal') {
        const width = pane[0].clientWidth;
        const height = pane[0].clientHeight - size - 4;
        modelRunnerState.modelRunner.resize_window(width, height);
      } else {
        const width = pane[0].clientWidth - size - 5;
        const height = pane[0].clientHeight;
        modelRunnerState.modelRunner.resize_window(width, height);
      }
    }
    setResize(size);
  }, 50);

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
        {/* @ts-ignore */}
        <SplitPane
          style={{overflow: 'scroll', height: `${getPaneHeight()}px`}}
          split={orientation}
          allowResize={true}
          defaultSize={getPaneHeight()}
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
          <div className="relative h-full w-full">
            {isGERunning && (
              <div className="absolute h-full w-full flex flex-col justify-center items-center bg-secondary-midnight z-[90]">
                <div className="mb-5">Building Model</div>
                <LoadingBar />
              </div>
            )}
            <ModelFooter />
            <div className="h-full w-full relative">
              <ModelControls />
              <Model />
            </div>
          </div>
        </SplitPane>
      </div>
    )
  );
};
