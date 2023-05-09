import React from 'react';
import { useRecoilValue } from 'recoil';
import { MainDropzone } from '../projectSidebar/files';
import SplitPane from 'react-split-pane';
import { Datagrid } from './DataGrid';
import { GridHeader } from './GridHeader';
import { ModelFooter } from './ModelFooter';

import { filesOpenSelector } from 'state/files';
import { useResize } from 'services/useResize';

export const GridContainer = () => {
  const openFiles = useRecoilValue(filesOpenSelector);
  const { handlePaneResize, defaultSize, maxSize, minSize, split } = useResize();

  return (
    <div className="relative h-full w-full">
      <SplitPane
        split={split()}
        allowResize={true}
        defaultSize={defaultSize()}
        maxSize={maxSize()} // window.innerHeght - headers
        minSize={minSize()} // always show col headers
        onChange={handlePaneResize}
        primary={'first'}
      >
        <div className="flex flex-col w-full">
          {openFiles?.length > 0 ? (
            <>
              <GridHeader />
              <Datagrid />
            </>
          ) : (
            <MainDropzone />
          )}
        </div>
      </SplitPane>
    </div>
  );
};
