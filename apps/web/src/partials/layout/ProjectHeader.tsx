import React from 'react';
import { useRouter } from 'next/router';
import { useRecoilState, useRecoilValue } from 'recoil';
import produce from 'immer';
import {
  showHorizontalOrientationAtom,
  showShareModalOpenAtom,
  showSearchModalAtom,
  showInfoDropdownAtom,
  showNotificationDropdownAtom,
  rowsSelector,
  projectAtom,
} from 'state';

import HorizontalIcon from 'public/svg/horizontal-layout.svg';
import ShareIcon from 'public/svg/share-icon.svg';
import BackBtnIcon from 'public/svg/back-button-icon.svg';
import ShowAddIcon from 'public/svg/show-add-project.svg';
import NotificationIcon from 'public/svg/notification-icon.svg';

export const ProjectHeader = () => {
  const [selectedProject, setSelectedProject] = useRecoilState(projectAtom);
  const [showSearchModalOpen, setShowSearchModalOpen] = useRecoilState(showSearchModalAtom);
  const [isShareOpen, setShare] = useRecoilState(showShareModalOpenAtom);
  const [isInfoOpen, setShowInfo] = useRecoilState(showInfoDropdownAtom);
  const [isNotificationOpen, setNotification] = useRecoilState(showNotificationDropdownAtom);
  const [paneOrientation, setOrientation] = useRecoilState(showHorizontalOrientationAtom);
  const rows = useRecoilValue(rowsSelector);

  const router = useRouter();

  const backPresssed = () => {
    setSelectedProject(null);
    setShare(false);
    setShowInfo(false);
    setNotification(false);
    setShowSearchModalOpen(false);

    try {
      //close glyph viewer
      window?.core.CloseModel();
    } catch (error) {
      // do nothng
    }
    router.push('/');
  };

  const handleChange = (e) => {
    setSelectedProject((prev) => ({ ...prev, name: e.target.value }));
  };

  const handlePaneSwitch = () => {
    setOrientation(produce((draft) => (draft = !draft)));
  };

  return (
    <div
      className={`sticky flex items-center bg-secondary-space-blue border-l border-b border-gray h-[50px] w-full pl-[16px] ${
        rows?.length > 0 && !isShareOpen && !isInfoOpen && !isNotificationOpen ? 'pr-[16px]' : 'pr-[16px]'
      }`}
    >
      <button
        onClick={backPresssed}
        className="flex items-center justify-center rounded-lg border border-transparent ml-4 pr-4 pl-2 pt-1 pb-1 hover:border-white"
      >
        <BackBtnIcon />
        <span className="text-light-gray font-roboto font-medium text-[14px] leading-[16px] text-center ml-2">
          Back
        </span>
      </button>
      <input
        className="p-1 m-2 text-white font-rubik font-normal text-[22px] tracking-[.01em] leading-[26px] flex text-left outline-none border-2 border-transparent rounded-lg pr-2 ml-6 bg-transparent hover:border-yellow"
        defaultValue={selectedProject?.name}
        // onChange={updateProjectName}
      />

      <div className="px-4 sm:px-6 lg:px-0 lg:w-full">
        <div className={`flex items-center ${selectedProject ? 'justify-end' : 'justify-between'} h-16`}>
          {/* Search form */}

          {/* Header: Right side */}
          <div className="flex justify-end items-center space-x-2">
            <button
              className={`h-6 px-2 flex items-center justify-center bg-primary-yellow hover:bg-primary-yellow-hover transition duration-150 rounded-[2px] ml-3 ${
                showSearchModalOpen && 'bg-gray'
              }`}
              onClick={(e) => {
                setShowInfo(false);
                setShare(true);
                setNotification(false);
              }}
              aria-controls="share-modal"
            >
              <ShareIcon />
              <b className="text-secondary-midnight font-roboto font-medium leading-[16px] pl-1">Share</b>
            </button>
            {
              <button
                className="h-8 px-2 flex items-center justify-center rounded-lg hover:bg-gray"
                onClick={handlePaneSwitch}
              >
                <HorizontalIcon />
              </button>
            }
            <button
              className={`h-8 p-2 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-3`}
              onClick={(e) => {
                // setShowAddProject(selectedProject ? true : false);
                setShare(false);
                setShowInfo(true);
                setNotification(false);
              }}
              aria-controls="info-modal"
            >
              <ShowAddIcon />
            </button>
            <button
              className={`h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0`}
              onClick={(e) => {
                setShare(false);
                setShowInfo(false);
                setNotification(true);
              }}
              aria-controls="notifications-modal"
            >
              <NotificationIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
