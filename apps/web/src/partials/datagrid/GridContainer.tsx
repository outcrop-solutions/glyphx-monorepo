import React from 'react';
import { rowsSelector } from 'state/files';
import { useRecoilValue } from 'recoil';
import { MainDropzone } from '../files';
import { Datagrid } from './DataGrid';
import { ModelFooter } from './ModelFooter';
import { GridHeader } from 'partials';

export const GridContainer = () => {
  const rows = useRecoilValue(rowsSelector);

  return (
    <>
      {rows?.length > 0 ? (
        <>
          {true ? (
            <div className="">
              <div className="flex flex-col">
                <GridHeader />
                <Datagrid />
              </div>
              <div className={`flex flex-col`}>
                <ModelFooter />
              </div>
            </div>
          ) : (
            <div className={`flex flex-col h-full w-full `}>
              <GridHeader />
              <Datagrid />
            </div>
          )}
        </>
      ) : (
        <MainDropzone />
      )}
    </>
  );
};
