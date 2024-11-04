'use client';
import React, {useCallback, useEffect} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import produce from 'immer';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';
import {canvasSizeAtom, drawerOpenAtom, modelRunnerAtom, orientationAtom, splitPaneSizeAtom} from 'state';
import HorizontalIcon from 'svg/horizontal-layout.svg';
import VerticalIcon from 'svg/vertical-layout.svg';

const btnClass =
  'h-8 p-1 flex items-center justify-center bg-transparent border border-transparent hover:border-white transition duration-150 rounded-[2px] ml-0';

export const OrientationToggle = () => {
  const modelRunner = useRecoilValue(modelRunnerAtom);
  const [orientation, setOrientation] = useRecoilState(orientationAtom);
  const setResize = useSetRecoilState(splitPaneSizeAtom);
  const setDrawer = useSetRecoilState(drawerOpenAtom);

  const handleOrientation = useCallback(() => {
    setOrientation(
      produce((draft: WritableDraft<webTypes.SplitPaneOrientation>) => {
        if (draft === 'horizontal') {
          return 'vertical';
        } else {
          return 'horizontal';
        }
      })
    );
  }, [setOrientation]);

  useEffect(() => {
    // resize event based on drag
    const pane = document.getElementsByClassName('SplitPane')[0] as HTMLElement;
    // this lets us resize dynamically after the model has resized
    const pane1 = document.getElementsByClassName('Pane1')[0] as HTMLElement;
    if (pane && pane1) {
      // from vertical to horizontal
      if (orientation === 'horizontal') {
        const width = pane.clientWidth;
        const height = 400;
        if (modelRunner) {
          modelRunner.resize_window(width, height);
        }
        // dynamically resize pane 1
        pane1.style.height = `${height}px`;
      } else {
        // from horizontal to vertical
        const width = 400;
        const height = pane.clientHeight;
        if (modelRunner) {
          modelRunner.resize_window(width, height);
        }
        // dynamically resize pane 1
        pane1.style.width = `${width}px`;
      }
    }
  }, [modelRunner, orientation]);

  return (
    <button onClick={() => handleOrientation()} className={`${btnClass}`}>
      {orientation === 'horizontal' ? <HorizontalIcon /> : <VerticalIcon />}
    </button>
  );
};
