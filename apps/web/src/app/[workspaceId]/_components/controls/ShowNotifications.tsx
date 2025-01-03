'use client';
import React from 'react';
import {webTypes} from 'types';
import NotificationIcon from 'svg/notification-icon.svg';
import {useSetRecoilState} from 'recoil';
import {rightSidebarControlAtom} from 'state';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px]';

export const ShowNotifications = () => {
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);

  const handleControl = (ctrl: webTypes.constants.RIGHT_SIDEBAR_CONTROL) => {
    setRightSidebarControl(
      produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
        draft.type = ctrl;
      })
    );
  };

  return (
    <button
      className={`${btnClass}`}
      onClick={() => handleControl(webTypes.constants.RIGHT_SIDEBAR_CONTROL.INFO)}
      aria-controls="notifications-modal"
    >
      <NotificationIcon />
    </button>
  );
};
