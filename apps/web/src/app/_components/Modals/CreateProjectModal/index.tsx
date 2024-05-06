import React, {useState} from 'react';
import produce from 'immer';
import {webTypes} from 'types';
import {NewProject} from './NewProject';
import ImportProject from './ImportProject';
import TemplateLibrary from './TemplateLibrary';

import {useSetRecoilState} from 'recoil';

import BackBtnIcon from 'svg/back-btn-icon.svg';
import ImportProjectIcon from 'svg/import-project-icon.svg';
import BlankProjectIcon from 'svg/blank-project-icon.svg';
import TemplateLibraryIcon from 'svg/template-lib-icon.svg';
import {WritableDraft} from 'immer/dist/internal';
import {modalsAtom} from 'state';

// export const CreateProjectModal = ({ modalContent }: webTypes.CreateProjectModalProps) => {
export const CreateProjectModal = () => {
  const setModals = useSetRecoilState(modalsAtom);
  const [current, setCurrent] = useState(0);

  const handleClickAway = () => {
    setModals(
      produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
        draft.modals.splice(0, 1);
      })
    );
  };

  return (
    <div className="rounded-lg flex flex-row bg-secondary-midnight w-[600px] z-60">
      <aside className="flex flex-col rounded-l-lg bg-secondary-space-blue w-[200px]">
        <div
          onClick={handleClickAway}
          className="group flex flex-row items-center mt-4 mx-2 p-1 border border-transparent hover:cursor-pointer hover:border-light-gray hover:bg-secondary-midnight"
        >
          <BackBtnIcon />
          <p className="whitespace-nowrap font-roboto font-medium text-[14px] leading-[16px] text-light-gray group-hover:text-white">
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
            <p className="whitespace-nowrap">New Project</p>
          </div>
          <div
            onClick={() => {
              setCurrent(1);
            }}
            className="group flex flex-row justify-start items-center space-x-1 border border-transparent rounded-[2px] hover:cursor-pointer hover:border-white hover:bg-secondary-midnight hover:text-white"
          >
            <ImportProjectIcon />
            <p className="whitespace-nowrap">Import Project</p>
          </div>
          <div
            onClick={() => {
              setCurrent(2);
            }}
            className="group flex flex-row justify-start items-center space-x-1 border border-transparent rounded-[2px] hover:cursor-pointer hover:border-white hover:bg-secondary-midnight hover:text-white"
          >
            <TemplateLibraryIcon />
            <p className="whitespace-nowrap">Template Library</p>
          </div>
        </div>
      </aside>
      <div className="grow">
        {current === 0 ? <NewProject exit={handleClickAway} /> : <></>}
        {current === 1 ? <ImportProject exit={handleClickAway} /> : <></>}
        {current === 2 ? <TemplateLibrary exit={handleClickAway} /> : <></>}
      </div>
    </div>
  );
};
