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
    const defaultSize = 400; // the default size of the data grid (width for vertical, height for horizontal)
    const pane = document.getElementsByClassName('SplitPane')[0] as HTMLElement;
    const pane1 = document.getElementsByClassName('Pane1')[0] as HTMLElement;
    const pane2 = document.getElementsByClassName('Pane2')[0] as HTMLElement;

    if (pane && pane1 && pane2) {
      const width = pane.clientWidth; // full container width
      const height = pane.clientHeight; // full container height
      // data grid pane
      const gridWidth = pane1.clientWidth;
      const gridHeight = pane1.clientHeight;
      // model canvas pane
      const pane2Width = pane2.clientWidth;
      const pane2Height = pane2.clientHeight;
      // model container
      const modelContainer = document.getElementById('glyphx-cube-model') as HTMLElement;
      // check values
      console.log({width, height, gridWidth, gridHeight, pane2Width, pane2Height});
      // model dimensions based on default size
      const modelWidth = width - defaultSize;
      const modelHeight = height - defaultSize;
      // // this lets us resize dynamically after the model has resized
      // const pane1 = document.getElementsByClassName('Pane1')[0] as HTMLElement;
      if (pane && modelRunner) {
        // from vertical to horizontal
        if (orientation === 'horizontal') {
          // resize window so we can get accurate height
          modelRunner.resize_window(width, modelHeight);
          modelContainer.style.height = `${modelHeight}px`;
          // get actual height
          // const pane2 = document.getElementById('glyphx-cube-model') as HTMLElement;
          // resize it
          // modelRunner.resize_window(width, pane2.clientHeight);
          // }
          // dynamically resize pane 1
        } else {
          // from horizontal to vertical
          modelRunner.resize_window(modelWidth, height);
          modelContainer.style.width = `${modelWidth}px`;
          // dynamically resize pane 1
          // pane1.style.width = `${width}px`;
        }
      }
    }
  }, [modelRunner, orientation]);

  return (
    <button onClick={() => handleOrientation()} className={`${btnClass}`}>
      {orientation === 'horizontal' ? <HorizontalIcon /> : <VerticalIcon />}
    </button>
  );
};
