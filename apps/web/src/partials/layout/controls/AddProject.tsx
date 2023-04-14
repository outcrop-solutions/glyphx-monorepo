import React from 'react';
import NewProjectIcon from 'public/svg/new-project-icon.svg';
import { useSetRecoilState } from 'recoil';
import { showAddProjectAtom } from 'state';
import produce from 'immer';

const btnTextPrimary = 'text-black font-roboto font-medium leading-[16px] pl-1';

const btnPrimary =
  'h-8 p-1 flex items-center justify-center bg-yellow border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const AddProject = () => {
  const setShowAddProject = useSetRecoilState(showAddProjectAtom);

  const handleNewProject = () => {
    setShowAddProject(true);
  };
  return (
    <button className={`${btnPrimary}`} onClick={() => handleNewProject()} aria-controls="create-project-modal">
      <NewProjectIcon />
      <p className={`${btnTextPrimary}`}>New Model</p>
    </button>
  );
};
