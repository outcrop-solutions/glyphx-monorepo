'use client';
import React, {useCallback} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';
import {
  canvasSizeAtom,
  drawerOpenAtom,
  modelRunnerAtom,
  orientationAtom,
  splitPaneSizeAtom,
  windowSizeAtom,
} from 'state';
import HorizontalIcon from 'svg/horizontal-layout.svg';
import VerticalIcon from 'svg/vertical-layout.svg';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const OrientationToggle = () => {
  const [modelRunnerState, setModelRunnerState] = useRecoilState(modelRunnerAtom);
  const size = useRecoilValue(canvasSizeAtom);
  const [orientation, setOrientation] = useRecoilState(orientationAtom);
  const setPaneSize = useSetRecoilState(splitPaneSizeAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);

  const handleOrientation = useCallback(() => {
    if (modelRunnerState?.initialized) {
      if (orientation === 'horizontal') {
        setDrawer(true);
        setPaneSize(400);
      } else if (size.width) {
        console.log(`Resize event - width: ${size.width}, height: 200`);
        modelRunnerState.modelRunner.resize_window(size.width, 400);
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
    }
  }, [orientation, setOrientation, setDrawer, setPaneSize, modelRunnerState, size]);

  return (
    <button onClick={() => handleOrientation()} className={`${btnClass}`}>
      {orientation === 'horizontal' ? <HorizontalIcon /> : <VerticalIcon />}
    </button>
  );
};
