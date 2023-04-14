import React, { useState } from 'react';
import { NewProject } from './NewProject';
import ImportProject from './ImportProject';
import TemplateLibrary from './TemplateLibrary';

import { useSetRecoilState } from 'recoil';
import { showModalAtom } from 'state';

import BackBtnIcon from 'public/svg/back-btn-icon.svg';
import ImportProjectIcon from 'public/svg/import-project-icon.svg';
import BlankProjectIcon from 'public/svg/blank-project-icon.svg';
import TemplateLibraryIcon from 'public/svg/template-lib-icon.svg';
import produce from 'immer';

export const CreateProjectModal = () => {
  const setShowAddProject = useSetRecoilState(showModalAtom);
  const [current, setCurrent] = useState(0);

  const handleClickAway = () => {
    setShowAddProject(
      produce((draft) => {
        draft.type = false;
      })
    );
  };

  return (
    <div className="rounded-lg flex flex-row w-[928px] h-[506px] bg-secondary-midnight z-60">
      <div className="flex flex-col rounded-l-lg bg-secondary-space-blue w-[240px]">
        <div
          onClick={handleClickAway}
          className="group flex flex-row items-center mt-4 mx-2 p-1 border border-transparent hover:cursor-pointer hover:border-light-gray hover:bg-secondary-midnight"
        >
          <BackBtnIcon />
          <p className=" font-roboto font-medium text-[14px] leading-[16px] text-light-gray group-hover:text-white">
            Back to Dashboard
          </p>
        </div>
        <hr className="mx-2 text-light-gray mt-1" />
        <div className="mt-5 mx-4 space-y-3 font-roboto font-medium text-[14px] leading-[16px] text-light-gray">
          <div
            onClick={() => {
              setCurrent(0);
            }}
            className="group flex flex-row justify-start items-center space-x-1 border border-transparent rounded-[2px] hover:cursor-pointer hover:border-white hover:bg-secondary-midnight hover:text-white"
          >
            <BlankProjectIcon />
            <p>New Project</p>
          </div>
          <div
            onClick={() => {
              setCurrent(1);
            }}
            className="group flex flex-row justify-start items-center space-x-1 border border-transparent rounded-[2px] hover:cursor-pointer hover:border-white hover:bg-secondary-midnight hover:text-white"
          >
            <ImportProjectIcon />
            <p>Import Project</p>
          </div>
          <div
            onClick={() => {
              setCurrent(2);
            }}
            className="group flex flex-row justify-start items-center space-x-1 border border-transparent rounded-[2px] hover:cursor-pointer hover:border-white hover:bg-secondary-midnight hover:text-white"
          >
            <TemplateLibraryIcon />
            <p>Template Library</p>
          </div>
        </div>
      </div>
      {current === 0 ? <NewProject exit={handleClickAway} /> : <></>}
      {current === 1 ? <ImportProject exit={handleClickAway} /> : <></>}
      {current === 2 ? <TemplateLibrary exit={handleClickAway} /> : <></>}
    </div>
  );
};
