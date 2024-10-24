'use client';
import React, {useEffect, useRef} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {canvasSizeAtom, modelRunnerSelector} from 'state';
import {useHotkeys} from 'react-hotkeys-hook';
import {useDebounceCallback, useResizeObserver} from 'usehooks-ts';

type Size = {
  width?: number;
  height?: number;
};

export const Model = () => {
  const modelRunner = useRecoilValue(modelRunnerSelector);
  // get debounced size changes
  const ref = useRef<HTMLDivElement>(null);
  const [_, setSize] = useRecoilState<Size>(canvasSizeAtom);

  // debounce observer every 200 ms
  const onResize = useDebounceCallback(setSize, 200);
  useResizeObserver({
    ref,
    onResize,
  });

  // setup our keybindings
  useHotkeys('up', () => {
    console.log('move model up');
    modelRunner.raise_model(10);
  });
  useHotkeys('down', () => {
    console.log('move model up');
    modelRunner.raise_model(-10);
  });
  useHotkeys('left', () => {
    console.log('move model left');
    modelRunner.shift_model(-10);
  });
  useHotkeys('right', () => {
    console.log('move model right');
    modelRunner.raise_model(10);
  });

  // ensure canvas takes focus if it exists
  useEffect(() => {
    const canvas = document.getElementById('cube-model') as HTMLCanvasElement;
    if (canvas) {
      canvas?.focus();
    }
  }, []);

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div
        ref={ref}
        id="glyphx-cube-model"
        className="flex items-center justify-center h-full w-full bg-[#0d0f21]"
      ></div>
    </div>
  );
};
