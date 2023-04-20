import React from 'react';
import HorizontalIcon from 'public/svg/horizontal-layout.svg';
import VerticalIcon from 'public/svg/vertical-layout.svg';
import { useRecoilState } from 'recoil';
import { orientationAtom, viewerPositionSelector } from 'state';
import produce from 'immer';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const OrientationToggle = () => {
  const [orientation, setOrientation] = useRecoilState(orientationAtom);

  const handleOrientation = () => {
    setOrientation(
      produce((draft) => {
        // @ts-ignore
        if (draft === 'horizontal') {
          // @ts-ignore
          return 'vertical';
        } else {
          // @ts-ignore
          return 'horizontal';
        }
      })
    );
  };

  return (
    <button onClick={() => handleOrientation()} className={`${btnClass}`}>
      {orientation === 'horizontal' ? <HorizontalIcon /> : <VerticalIcon />}
    </button>
  );
};
