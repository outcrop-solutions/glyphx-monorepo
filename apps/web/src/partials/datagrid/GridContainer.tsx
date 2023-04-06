import React from 'react';
import { useRecoilValue } from 'recoil';
import { MainDropzone } from '../files';
import { Datagrid } from './DataGrid';
import { GridHeader } from './GridHeader';
import { ModelFooter } from './ModelFooter';
import { GridLoadingAnimation, LoadingModelAnimation } from 'partials/loaders';

import { filesOpenSelector } from 'state/files';
import { showDataGridLoadingAtom, showModelCreationLoadingAtom } from 'state/ui';

export const GridContainer = () => {
  const openFiles = useRecoilValue(filesOpenSelector);
  const dataGridLoading = useRecoilValue(showDataGridLoadingAtom);
  const modelCreationLoading = useRecoilValue(showModelCreationLoadingAtom);

  return (
    <>
      {openFiles?.length > 0 ? (
        <div className="flex flex-col">
          <GridHeader />
          <Datagrid />
          {/* <ModelFooter /> */}
        </div>
      ) : (
        <MainDropzone />
      )}
    </>
  );
};
