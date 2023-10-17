import React from 'react';
import TableItemInfoIcon from 'public/svg/table-item-info.svg';
import {CogIcon} from '@heroicons/react/outline';

const dateOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export const File = ({file}) => {
  return (
    <div className="bg-secondary-space-blue rounded py-2 px-6 border border-transparent hover:border-white hover:bg-secondary-midnight hover:cursor-pointer font-roboto font-normal text-[14px] leading-[16px] tracking-[0.01em] text-light-gray hover:text-white">
      <div title="Project Name" className="pl-2">
        {file?.fileName}
      </div>
      <div title="Last Updated" className="p-2">
        {file?.updatedAt && new Date(file?.updatedAt).toLocaleDateString('en-US', dateOptions as any)}
      </div>
      <div title="Data Used" className="p-2">
        {file.fileSize}
      </div>
      <div className="pr-2 py-2 flex flex-row items-center justify-end space-x-1">
        {/* info button */}
        <TableItemInfoIcon />
        {/* delete button */}
        <CogIcon className="h-4 w-4" />
      </div>
    </div>
  );
};
