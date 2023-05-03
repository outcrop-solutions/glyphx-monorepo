import React from 'react';
import { useRecoilState } from 'recoil';
import produce from 'immer';
import { WritableDraft } from 'immer/dist/internal';
import { web as webTypes } from '@glyphx/types';
import { orientationAtom } from 'state';
import HorizontalIcon from 'public/svg/horizontal-layout.svg';
import VerticalIcon from 'public/svg/vertical-layout.svg';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const OrientationToggle = () => {
  const [orientation, setOrientation] = useRecoilState(orientationAtom);

  const handleOrientation = () => {
    setOrientation(
      produce((draft: WritableDraft<webTypes.SplitPaneOrientation>) => {
        if (draft === 'horizontal') {
          return 'vertical';
        } else {
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
