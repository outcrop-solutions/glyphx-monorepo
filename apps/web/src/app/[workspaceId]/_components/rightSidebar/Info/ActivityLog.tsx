'use client';
import useProjectLogs from 'lib/client/hooks/useProjectLogs';
import React from 'react';

export const ActivityLog = () => {
  const {isLoading, data} = useProjectLogs();

  return !isLoading ? (
    <div className="mt-4 pl-4 pr-4 font-roboto">
      <div>
        <p className="text-light-gray  font-medium text-[14px] leading-[16px] border-b-[1px] border-gray pb-2">
          Activity
        </p>
      </div>
      <div className="w-full h-full">
        {data?.map(({action, actor, onModel, resource}) => (
          <p className="text-light-gray font-normal text-[10px] whitespace-nowrap truncate mt-2 leading-[12px]">
            <b>{actor.name}</b> {action} <b>{onModel}</b> {resource.name}
          </p>
        ))}
      </div>
    </div>
  ) : (
    <></>
  );
};
