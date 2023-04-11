import React from 'react';
import Image from 'next/image';

import { MemberList } from '../invite/MemberList';
import { projectAtom } from 'state';
import { useRecoilValue } from 'recoil';

import ProjectIcon from 'public/svg/project-icon.svg';
import CloseProjectInfoIcon from 'public/svg/close-project-info.svg';
export const Info = ({ setInfo, setShare }) => {
  const selectedProject = useRecoilValue(projectAtom);

  return (
    <div className="flex flex-col w-[250px] bg-secondary-space-blue h-full border border-l-gray border-l-1 border-t-gray border-t-1">
      <div className="pt-4 pl-4 pr-4  overflow-auto">
        <div className="flex flex-row justify-between mb-2 items-center">
          <div className="flex flex-row justify-between space-x-3">
            <ProjectIcon />
            <p className="text-light-gray text-[14px] leading-[16px] font-medium font-roboto">
              {selectedProject ? selectedProject.name : 'My Projects'}
            </p>
          </div>
          <div
            onClick={() => {
              setInfo(false);
            }}
          >
            <CloseProjectInfoIcon />
          </div>
        </div>
      </div>
      <Image className="w-full h-auto" src="/images/project.png" alt="Sample Project" />
      <div className="mt-2 pl-4 pr-4">
        <p className="text-light-gray font-roboto font-medium text-[14px] leading-[16.41px]">Owner</p>
        <div className="flex flex-row justify-between items-center mt-2 ">
          <div className="flex items-center">
            <div className="rounded-full bg-secondary-blue h-5 w-5 text-sm text-white flex items-center justify-center mr-2">
              {`${selectedProject.author.split('@')[0][0].toUpperCase()}`}
            </div>
            <p className="text-light-gray font-roboto text-[10px] leading-[12px]">{selectedProject.author}</p>
          </div>
          <div>
            <p className="text-gray font-roboto font-normal text-[10px] leading-[12px]">
              {new Date(selectedProject.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-4 pl-4 pr-4">
        <div className="flex flex-row justify-between items-center font-roboto font-medium text-light-gray text-[14px] leading-[16px]">
          <p>Shared with</p>
          <div
            onClick={() => {
              setInfo(false);
              setShare(true);
            }}
            className="flex flex-row item-center justify-center space-x-2 px-2 py-[0.5px] border border-transparent rounded-xl hover:border-white hover:cursor-pointer hover:bg-secondary-midnight"
          >
            <p>Edit</p>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.37231 4.01333L7.98556 4.62667L1.9464 10.6667H1.33315V10.0533L7.37231 4.01333ZM9.77198 0C9.60533 0 9.43202 0.0666666 9.30537 0.193333L8.08554 1.41333L10.5852 3.91333L11.805 2.69333C12.065 2.43333 12.065 2.01333 11.805 1.75333L10.2452 0.193333C10.1119 0.06 9.94529 0 9.77198 0ZM7.37231 2.12667L0 9.5V12H2.49965L9.87196 4.62667L7.37231 2.12667Z"
                fill="#CECECE"
              />
            </svg>
          </div>
        </div>
        <div className="mt-2 border-b-[1px] border-t-[1px] border-gray">
          <MemberList size="small" />
        </div>
      </div>
      <div className="mt-4 pl-4 pr-4 font-roboto">
        <p className="text-light-gray  font-medium text-[14px] leading-[16px] border-b-[1px] border-gray pb-2">
          Activity
        </p>
        <p className="text-light-gray font-normal text-[10px] mt-2 leading-[12px]">Under Development :)</p>
      </div>
    </div>
  );
};
