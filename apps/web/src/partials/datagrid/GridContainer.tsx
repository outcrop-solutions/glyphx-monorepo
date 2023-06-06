import React from 'react';
import { useRecoilValue } from 'recoil';
import { MainDropzone } from '../projectSidebar/files';
import SplitPane from 'react-split-pane';
import { Datagrid } from './DataGrid';
import { GridHeader } from './GridHeader';
import { ModelFooter } from './ModelFooter';

import { filesOpenSelector } from 'state/files';
import { useResize } from 'services/useResize';
import { orientationAtom, projectAtom, splitPaneSizeAtom, windowSizeAtom } from 'state';
import useDataGrid from 'lib/client/hooks/useDataGrid';
import Image from 'next/image';

export const GridContainer = () => {
  const { data } = useDataGrid();
  const openFiles = useRecoilValue(filesOpenSelector);
  const project = useRecoilValue(projectAtom);
  const orientation = useRecoilValue(orientationAtom);
  const { height } = useRecoilValue(windowSizeAtom);
  const { handlePaneResize, defaultSize, maxSize, minSize, split } = useResize();
  const resize = useRecoilValue(splitPaneSizeAtom);
  const isBrowser = !(window && window?.core);

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
    <div className="relative h-full w-full border-r border-gray">
      <ModelFooter />
      <SplitPane
        style={{ overflow: 'scroll', height: `${getPaneHeight()}px` }}
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
        {isBrowser && project?.imageHash ? (
          <div className="h-full w-full aspect-video p-20">
            <Image
              className="mt-[44px]"
              src={project.imageHash && `data:image/png;base64,${project.imageHash}`}
              layout="fill"
              alt="model"
            />
          </div>
        ) : null}
      </SplitPane>
    </div>
  );
};
