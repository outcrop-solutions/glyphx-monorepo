import React from 'react';
import { rightSidebarControlAtom } from 'state';
import { useRecoilState } from 'recoil';
import produce from 'immer';
import NotificationIcon from 'public/svg/notif-icon.svg';
import CloseNotificationsIcon from 'public/svg/close-project-info.svg';

export const Notifications = () => {
  const [sidebarControl, setRightSidebarControl] = useRecoilState(rightSidebarControlAtom);

  const handleClose = () => {
    setRightSidebarControl(
      produce((draft) => {
        draft.type = false;
      })
    );
  };

  return (
    <div className="flex flex-col w-[250px] bg-secondary-space-blue h-full">
      <div className="pt-5 pl-3 pr-3">
        <div className="flex flex-row justify-between mb-2">
          <p className="text-light-gray font-roboto font-medium text-[14px] leading-[16.41px]">
            {/* <span className="inline-block mr-2">
              <NotificationIcon />
            </span> */}
            Notifications
          </p>
          <div onClick={handleClose}>
            <CloseNotificationsIcon />
          </div>
        </div>
      </div>
      <div>
        <div className="mt-4 border-t-[1px] border-t-gray">
          <p className="font-roboto font-normal text-[10px] leading-[12px] text-gray mt-2">
            {new Date(sidebarControl.data.createdAt).toLocaleDateString()}{' '}
            {new Date(sidebarControl.data.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="flex flex-row mt-2">
            <div className="flex items-center">
              <div className=" relative rounded-full bg-cyan h-5 w-5 text-sm text-white flex items-center justify-center mr-2">
                {`${sidebarControl.data.owner.name[0].toUpperCase()}`}
                <div className="rounded-full bg-primary-yellow h-1 w-1" />
              </div>
            </div>
            <p className="font-roboto font-bold text-[12px] leading-[14px] text-light-gray">
              {sidebarControl.data.owner.name} <span className="font-normal">created the project</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
