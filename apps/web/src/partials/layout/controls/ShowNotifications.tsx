import React from 'react';
import { web as webTypes } from '@glyphx/types';
import NotificationIcon from 'public/svg/notification-icon.svg';
import { useSetRecoilState } from 'recoil';
import { rightSidebarControlAtom } from 'state';
import produce from 'immer';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const ShowNotifications = () => {
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);
  const handleControl = (ctrl: webTypes.RightSidebarControl) => {
    setRightSidebarControl(
      produce((draft) => {
        draft = ctrl;
      })
    );
  };

  return (
    <button className={`${btnClass}`} onClick={() => handleControl('notification')} aria-controls="notifications-modal">
      <NotificationIcon />
    </button>
  );
};