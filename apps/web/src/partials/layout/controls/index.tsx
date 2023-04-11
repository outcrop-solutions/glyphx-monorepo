import React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import produce from 'immer';
import { web as webTypes } from '@glyphx/types';

import { GridToggle } from './GridToggle';
import { SettingsDropdown } from './SettingsDropdown';

import { projectAtom, showAddProjectAtom, showHorizontalOrientationAtom, rightSidebarControlAtom } from 'state';

import HorizontalIcon from 'public/svg/horizontal-layout.svg';
import ShareIcon from 'public/svg/share-icon.svg';
import ShowAddIcon from 'public/svg/show-add-project.svg';
import NotificationIcon from 'public/svg/notification-icon.svg';
import NewProjectIcon from 'public/svg/new-project-icon.svg';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';
const btnPrimary =
  'h-8 p-1 flex items-center justify-center bg-yellow border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';
const btnTextPrimary = 'text-black font-roboto font-medium leading-[16px] pl-1';

export const Controls = () => {
  const project = useRecoilValue(projectAtom);
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);
  const setOrientation = useSetRecoilState(showHorizontalOrientationAtom);
  const setShowAddProject = useSetRecoilState(showAddProjectAtom);

  const handleControl = (ctrl: webTypes.RightSidebarControl) => {
    setRightSidebarControl(
      produce((draft) => {
        draft = ctrl;
      })
    );
  };

  const handleOrientation = () => {
    setOrientation(
      produce((draft) => {
        draft = !draft;
      })
    );
  };

  const handleNewProject = () => {
    setShowAddProject(
      produce((draft) => {
        draft = !draft;
      })
    );
  };

  return (
    <div className="flex justify-end items-center space-x-2">
      <button className={`${btnPrimary}`} onClick={() => handleNewProject()} aria-controls="create-project-modal">
        <NewProjectIcon />
        <p className={`${btnTextPrimary}`}>New Model</p>
      </button>
      <GridToggle />
      <button className={`${btnPrimary}`} onClick={() => handleControl('share')} aria-controls="share-modal">
        <ShareIcon />
        <b className={`${btnTextPrimary}`}>Share</b>
      </button>
      <button onClick={() => handleOrientation()} className={`${btnClass}`}>
        <HorizontalIcon />
      </button>
      <button className={`${btnClass}`} onClick={() => handleControl('info')} aria-controls="info-modal">
        <ShowAddIcon />
      </button>
      <button
        className={`${btnClass}`}
        onClick={() => handleControl('notification')}
        aria-controls="notifications-modal"
      >
        <NotificationIcon />
      </button>
      <SettingsDropdown />
    </div>
  );
};
