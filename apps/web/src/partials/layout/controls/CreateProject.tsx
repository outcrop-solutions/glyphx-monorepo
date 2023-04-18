import React from 'react';
import NewProjectIcon from 'public/svg/new-project-icon.svg';
import { useSetRecoilState } from 'recoil';
import { showModalAtom } from 'state';
import produce from 'immer';

const btnTextPrimary = 'text-black font-roboto font-medium leading-[16px] pl-1';

const btnPrimary =
  'h-8 p-1 flex items-center justify-center bg-yellow border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const CreateProject = () => {
  const setShowCreateProject = useSetRecoilState(showModalAtom);

  const handleNewProject = () => {
    setShowCreateProject(
      produce((draft) => {
        draft.type = 'createProject';
      })
    );
  };

  return (
    <button className={`${btnPrimary}`} onClick={() => handleNewProject()} aria-controls="create-project-modal">
      <NewProjectIcon />
      <p className={`${btnTextPrimary}`}>New Model</p>
    </button>
  );
};