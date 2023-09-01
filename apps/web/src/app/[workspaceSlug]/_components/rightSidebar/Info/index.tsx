import React from 'react';
import Image from 'next/image';

import { webTypes } from 'types';
import { MemberList } from '../Share/MemberList';
import { rightSidebarControlAtom } from 'state';
import { useRecoilState } from 'recoil';

import ProjectIcon from 'public/svg/project-icon.svg';
import CloseProjectInfoIcon from 'public/svg/close-project-info.svg';
import produce from 'immer';
import projectCard from 'public/images/project.png';
import EditIcon from 'public/svg/edit-icon.svg';
import { WritableDraft } from 'immer/dist/internal';
import { ActivityLog } from './ActivityLog';

export const Info = () => {
  const [sidebarControl, setRightSidebarControl] = useRecoilState(rightSidebarControlAtom);

  const handleClose = () => {
    setRightSidebarControl(
      produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
        draft.type = webTypes.constants.RIGHT_SIDEBAR_CONTROL.CLOSED;
      })
    );
  };

  const openShare = () => {
    setRightSidebarControl(
      produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
        draft.type = webTypes.constants.RIGHT_SIDEBAR_CONTROL.SHARE;
      })
    );
  };

  return (
    <div className="flex flex-col w-[250px] bg-secondary-space-blue">
      <div className="flex items-center justify-between border border-gray h-[56px] px-3">
        <div className="flex flex-row justify-between space-x-3">
          <ProjectIcon />
          <p className="text-light-gray text-[14px] leading-[16px] font-medium font-roboto">
            {sidebarControl.data ? sidebarControl?.data?.name : 'My Projects'}
          </p>
        </div>
        <div onClick={handleClose}>
          <CloseProjectInfoIcon />
        </div>
      </div>
      <Image width={233} height={169} layout="responsive" src={projectCard} alt="Sample Project" />
      <div className="mt-2 pl-4 pr-4">
        <p className="text-light-gray font-roboto font-medium text-[14px] leading-[16.41px]">Owner</p>
        <div className="flex flex-row justify-between items-center mt-2 ">
          <div className="flex items-center">
            <div
              className={`rounded-full bg-secondary-cyan h-4 w-4 font-roboto font-medium text-[12px] text-center leading-[14px] tracking-[0.01em] text-white flex items-center justify-center mr-2`}
            >
              {`${sidebarControl?.data?.members[0]?.email?.charAt(0).toUpperCase()}`}
            </div>
            <p className="text-light-gray font-roboto text-[10px] leading-[12px]">
              {sidebarControl?.data?.members[0]?.email}
            </p>
          </div>
          <div>
            <p className="text-gray font-roboto font-normal text-[10px] leading-[12px]">
              {new Date(sidebarControl?.data?.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 pl-4 pr-4">
        <div className="flex flex-row justify-between items-center font-roboto font-medium text-light-gray text-[14px] leading-[16px]">
          <p>Shared with</p>
          <div
            onClick={openShare}
            className="flex flex-row item-center justify-center space-x-2 px-2 py-[0.5px] border border-transparent rounded-xl hover:border-white hover:cursor-pointer hover:bg-secondary-midnight"
          >
            <p>Edit</p>
            <EditIcon />
          </div>
        </div>
        <div className="mt-2 border-b-[1px] border-t-[1px] border-gray">
          <MemberList size="small" members={sidebarControl?.data?.members} />
        </div>
      </div>
      <ActivityLog />
    </div>
  );
};
