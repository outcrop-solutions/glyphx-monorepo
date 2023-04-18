import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { MainDropzone } from '../projectSidebar/files';
import SplitPane from 'react-split-pane';
import { Datagrid } from './DataGrid';
import { GridHeader } from './GridHeader';
import { debounce } from 'lodash';
import { ModelFooter } from './ModelFooter';
import { GridLoadingAnimation, LoadingModelAnimation } from 'partials/loaders';

import { filesOpenSelector } from 'state/files';
import { showDataGridLoadingAtom, showHorizontalOrientationAtom, showModelCreationLoadingAtom } from 'state/ui';

export const GridContainer = () => {
  const openFiles = useRecoilValue(filesOpenSelector);
  const orientation = useRecoilValue(showHorizontalOrientationAtom);
  const dataGridLoading = useRecoilValue(showDataGridLoadingAtom);
  const modelCreationLoading = useRecoilValue(showModelCreationLoadingAtom);

  const debouncedOnChange = debounce((data) => {
    console.log(data);
  }, 500);

  const handlePaneResize = useCallback(
    (size) => {
      debouncedOnChange(size);
    },
    [debouncedOnChange]
  );

  return (
    <div className="relative h-full w-full">
      {openFiles?.length > 0 ? (
        <SplitPane
          split={orientation ? 'horizontal' : 'vertical'}
          allowResize={true}
          defaultSize={700}
          maxSize={900}
          minSize={200}
          onChange={handlePaneResize}
          primary={'first'}
        >
          <div className="flex flex-col w-full">
            <GridHeader />
            <Datagrid />
            {/* <ModelFooter /> */}
          </div>
        </SplitPane>
      ) : (
        <MainDropzone />
      )}
    </div>
  );
};
