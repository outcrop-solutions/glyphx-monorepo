import React from 'react';
import { web as webTypes } from '@glyphx/types';
import produce from 'immer';
import ShowInfoIcon from 'public/svg/show-add-project.svg';
import { rightSidebarControlAtom } from 'state';
import { useSetRecoilState } from 'recoil';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px]';

export const ShowInfo = () => {
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);

  const handleControl = (ctrl: webTypes.RightSidebarControl) => {
    setRightSidebarControl(
      produce((draft) => {
        draft.type = ctrl;
      })
    );
  };

  return (
    <button className={`${btnClass}`} onClick={() => handleControl('info')} aria-controls="info-modal">
      <ShowInfoIcon />
    </button>
  );
};
