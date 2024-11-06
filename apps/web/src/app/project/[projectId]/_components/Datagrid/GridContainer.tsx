'use client';
import React, {useCallback, useEffect, useState} from 'react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {MainDropzone} from '../ProjectSidebar/_components/files';
import {Datagrid} from './DataGrid';
import {GridHeader} from './GridHeader';
import {ModelFooter} from './ModelFooter';
import {filesOpenSelector} from 'state/files';
import {
  geLoadingAtom,
  modelRunnerAtom,
  orientationAtom,
  shouldOpenSelector,
  splitPaneSizeAtom,
  windowSizeAtom,
} from 'state';
import SplitPane from 'react-split-pane';
import {Model} from '../Model';
import {ModelControls} from './ModelControls';
import {useDebounceCallback} from 'usehooks-ts';
import LoadingBar from 'app/_components/Loaders/LoadingBar';

export const GridContainer = () => {
  const modelRunner = useRecoilValue(modelRunnerAtom);
  const isGERunning = useRecoilValue(geLoadingAtom);
  const shouldOpen = useRecoilValue(shouldOpenSelector);
  // ensures we don't pre-render the server
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const openFiles = useRecoilValue(filesOpenSelector);
  const orientation = useRecoilValue(orientationAtom);
  const {height} = useRecoilValue(windowSizeAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);

  const paneSizeCallback = useCallback(
    (size) => {
      console.log({size});
      // resize event based on drag
      const pane = document.getElementsByClassName('SplitPane');
      if (orientation === 'horizontal') {
        const width = pane[0].clientWidth;
        const height = pane[0].clientHeight - size - 4;
        if (modelRunner) {
          modelRunner.resize_window(width, height);
        }
      } else {
        const width = pane[0].clientWidth - size - 5;
        const height = pane[0].clientHeight;
        if (modelRunner) {
          modelRunner?.resize_window(width, height);
        }
      }
      setResize(size);
    },
    [orientation, setResize, modelRunner]
  );

  const handlePaneResize = useDebounceCallback(paneSizeCallback, 50);

  const getPaneHeight = useCallback(() => {
    console.log({height, shouldOpen});
    if (height) {
      if (shouldOpen) {
        return 400;
      } else {
        return height - 105;
      }
    }
  }, [shouldOpen, height]);

  return (
    isClient &&
    height && (
      <div className="relative h-full w-full border-r border-gray">
        {/* @ts-ignore */}
        <SplitPane
          // style={{overflow: 'scroll', height: `${getPaneHeight()}px`}}
          split={orientation}
          allowResize={true}
          // defaultSize={400}
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
