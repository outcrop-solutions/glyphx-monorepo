'use client';
import React from 'react';
import TableItemInfoIcon from 'public/svg/table-item-info.svg';
import {CogIcon, DocumentIcon} from '@heroicons/react/outline';
import {formatFileSize} from 'lib/utils/formatFileSize';
import DragHandleIcon from 'public/svg/drag-handle.svg';
import {useDrag} from 'react-dnd';
const dateOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export const File = ({file}) => {
  const [{isDragging}, drag] = useDrag({
    item: {type: 'FILE_DRAG', file},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      className="group flex items-center justify-between bg-secondary-space-blue rounded py-1 px-6 border border-transparent hover:border-white hover:bg-secondary-midnight hover:cursor-pointer font-roboto font-normal text-[14px] leading-[16px] tracking-[0.01em] text-light-gray hover:text-white w-full"
    >
      <div className="flex items-center">
        <div className="group-hover:visible invisible mr-2">
          <DragHandleIcon />
        </div>
        <DocumentIcon className="w-4 h-4" />
        <div className="pl-2">{file?.fileName}</div>
        <div className="p-2">
          {file?.updatedAt
            ? new Date(file?.updatedAt).toLocaleDateString('en-US', dateOptions as any)
            : new Date().toLocaleDateString('en-US', dateOptions as any)}
        </div>
        <div className="p-2">{`${formatFileSize(file.fileSize)}`}</div>
      </div>
      <div className="pr-2 py-2 flex flex-row items-center justify-end space-x-1 float-right">
        <TableItemInfoIcon />
        <CogIcon className="h-4 w-4" />
      </div>
    </div>
  );
};
