'use client';
import React, {useState} from 'react';
import {Files} from './Files';
import {fileIngestionTypes} from 'types';
import TableItemInfoIcon from 'public/svg/table-item-info.svg';
import {CogIcon, TableIcon} from '@heroicons/react/outline';
import {formatFileSize} from 'lib/utils/formatFileSize';

const dateOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export const Table = ({table}) => {
  const [isCollapsed, setCollapsed] = useState(true);
  function sumFileSizes(fileStats: fileIngestionTypes.IFileStats[]): number {
    return fileStats.reduce((totalSize, file) => totalSize + file.fileSize, 0);
  }
  return (
    <div className="group">
      <summary
        onClick={() => {
          setCollapsed(!isCollapsed);
        }}
      >
        <div className="flex items-center justify-between bg-secondary-space-blue rounded py-1 px-6 border border-transparent hover:border-white hover:bg-secondary-midnight hover:cursor-pointer font-roboto font-normal text-[14px] leading-[16px] tracking-[0.01em] text-light-gray hover:text-white w-full">
          <div className="flex items-center justify-center">
            <div>
              {/* @jp-burford it's sinful but it's functional for now so*/}
              <svg
                className={`w-5 h-5 ${isCollapsed ? '-rotate-90' : 'rotate-180'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill="#CECECE"
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <TableIcon className="w-4 h-4" />
            <div className="pl-2">{table?.tableName}</div>
            <div className="p-2">
              {table?.updatedAt
                ? new Date(table?.updatedAt).toLocaleDateString('en-US', dateOptions as any)
                : new Date().toLocaleDateString('en-US', dateOptions as any)}
            </div>
            <div className="p-2">{`${formatFileSize(sumFileSizes(table.files))}`}</div>
          </div>
          <div className="pr-2 py-2 flex flex-row items-center justify-end space-x-1 float-right">
            <TableItemInfoIcon />
            <CogIcon className="h-4 w-4" />
          </div>
        </div>
      </summary>
      {!isCollapsed && <Files files={table.files} />}
    </div>
  );
};
