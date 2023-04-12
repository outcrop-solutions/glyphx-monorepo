import React from 'react';
import HorizontalIcon from 'public/svg/horizontal-layout.svg';
import { useSetRecoilState } from 'recoil';
import { showHorizontalOrientationAtom } from 'state';
import produce from 'immer';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const OrientationToggle = () => {
  const setOrientation = useSetRecoilState(showHorizontalOrientationAtom);

  const handleOrientation = () => {
    setOrientation(
      produce((draft) => {
        draft = !draft;
      })
    );
  };
  return (
    <button onClick={() => handleOrientation()} className={`${btnClass}`}>
      <HorizontalIcon />
    </button>
  );
};
