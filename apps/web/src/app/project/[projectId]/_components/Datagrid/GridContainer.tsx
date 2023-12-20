'use client';
import React, {useEffect, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {MainDropzone} from '../ProjectSidebar/_components/files';
import {Datagrid} from './DataGrid';
import {GridHeader} from './GridHeader';
import {ModelFooter} from './ModelFooter';

import {filesOpenSelector} from 'state/files';
import {useResize} from 'services/useResize';
import {orientationAtom, projectAtom, splitPaneSizeAtom, stateSelector, windowSizeAtom} from 'state';
import useDataGrid from 'lib/client/hooks/useDataGrid';
import SplitPane from 'react-split-pane';
import Image from 'next/image';

export const GridContainer = () => {
  // ensures we don't pre-render the server
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {data} = useDataGrid();
  const openFiles = useRecoilValue(filesOpenSelector);
  const activeState = useRecoilValue(stateSelector);
  const project = useRecoilValue(projectAtom);
  const orientation = useRecoilValue(orientationAtom);
  const {height} = useRecoilValue(windowSizeAtom);
  const {handlePaneResize, defaultSize, maxSize, minSize, split} = useResize();
  const resize = useRecoilValue(splitPaneSizeAtom);

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
          key={resize}
          split={split()}
          allowResize={true}
          defaultSize={defaultSize()}
          maxSize={maxSize()} // window.innerHeght - headers
          minSize={minSize()} // always show col headers
          onChange={handlePaneResize}
          primary={'first'}
        >
          <div className="flex flex-col w-full h-full">
            {openFiles?.length > 0 ? (
              <>
                <GridHeader data={data} />
                <Datagrid data={data} />
              </>
            ) : (
              <MainDropzone />
            )}
          </div>
          {project?.imageHash && !window?.core && (
            <div className={`${orientation === 'vertical' ? 'w-full' : 'h-2/3 w-2/3'} object-scale-down p-20 mx-auto`}>
              <Image
                src={
                  activeState?.imageHash
                    ? `data:image/png;base64,${activeState.imageHash}`
                    : project.imageHash && `data:image/png;base64,${project.imageHash}`
                }
                width={
                  activeState?.aspectRatio?.width ? activeState?.aspectRatio?.width : project?.aspectRatio?.width || 300
                }
                height={
                  activeState?.aspectRatio?.height
                    ? activeState?.aspectRatio?.height
                    : project?.aspectRatio?.height || 200
                }
                alt="model"
              />
            </div>
          )}
        </SplitPane>
      </div>
    )
  );
};
