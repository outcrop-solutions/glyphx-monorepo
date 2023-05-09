import useProjectLogs from 'lib/client/hooks/useProjectLogs';
import React from 'react';
import { useRecoilState } from 'recoil';
import { rightSidebarControlAtom } from 'state';

export const ActivityLog = () => {
  const [sidebarControl, setRightSidebarControl] = useRecoilState(rightSidebarControlAtom);
  const { isLoading, data } = useProjectLogs(sidebarControl.data._id);
  console.log({ isLoading, data });

  return (
    !isLoading && (
      <div className="mt-4 pl-4 pr-4 font-roboto">
        <div>
          <p className="text-light-gray  font-medium text-[14px] leading-[16px] border-b-[1px] border-gray pb-2">
            Activity
          </p>
        </div>
        <div className="w-full h-full">
          {data?.map(({ action, actor, createdAt, onModel, resource }) => (
            <p className="text-light-gray font-normal text-[10px] mt-2 leading-[12px]">{`${actor.name} ${action} ${onModel} ${resource.name}`}</p>
          ))}
        </div>
      </div>
    )
  );
};
