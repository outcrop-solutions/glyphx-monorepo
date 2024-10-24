'use client';
import React, {useCallback} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';
import {canvasSizeAtom, drawerOpenAtom, modelRunnerSelector, orientationAtom, splitPaneSizeAtom} from 'state';
import HorizontalIcon from 'svg/horizontal-layout.svg';
import VerticalIcon from 'svg/vertical-layout.svg';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const OrientationToggle = () => {
  const modelRunner = useRecoilValue(modelRunnerSelector);
  const size = useRecoilValue(canvasSizeAtom);
  const [orientation, setOrientation] = useRecoilState(orientationAtom);
  const setPaneSize = useSetRecoilState(splitPaneSizeAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);

  const handleOrientation = useCallback(() => {
    if (orientation === 'horizontal') {
      setDrawer(true);
      setPaneSize(400);
    }
    setOrientation(
      produce((draft: WritableDraft<webTypes.SplitPaneOrientation>) => {
        if (draft === 'horizontal') {
          return 'vertical';
        } else {
          return 'horizontal';
        }
      })
    );
  }, [orientation, setOrientation, setDrawer, setPaneSize]);

  return (
    <button onClick={() => handleOrientation()} className={`${btnClass}`}>
      {orientation === 'horizontal' ? <HorizontalIcon /> : <VerticalIcon />}
    </button>
  );
};
