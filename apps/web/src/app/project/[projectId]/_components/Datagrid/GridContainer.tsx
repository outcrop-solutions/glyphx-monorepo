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
import {debounce} from 'lodash';
import {ModelControls} from './ModelControls';

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
        {/* @ts-ignore */}
        <SplitPane
          style={{overflow: 'scroll', height: `${getPaneHeight()}px`}}
          split={orientation}
          allowResize={true}
          defaultSize={500}
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
