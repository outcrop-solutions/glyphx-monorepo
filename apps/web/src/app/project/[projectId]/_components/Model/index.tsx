'use client';
import React, {useEffect, useRef, useState} from 'react';
import {useRecoilState} from 'recoil';
import {modelRunnerAtom} from 'state';
import {useHotkeys} from 'react-hotkeys-hook';
import {useDebounceCallback, useResizeObserver} from 'usehooks-ts';

type Size = {
  width?: number;
  height?: number;
};

export const Model = () => {
  const [modelRunnerState, setModelRunnerState] = useRecoilState(modelRunnerAtom);
  const initializingRef = useRef(false); // Reference to track whether mouse events have been setup

  // get debounced size changes
  const ref = useRef<HTMLDivElement>(null);
  const [{width, height}, setSize] = useState<Size>({
    width: undefined,
    height: undefined,
  });

  // debounce observer every 200 ms
  const onResize = useDebounceCallback(setSize, 200);
  useResizeObserver({
    ref,
    onResize,
  });

  // pass resize events on each render
  useEffect(() => {
    if (width && height) {
      console.log(`Resize event - width: ${width}, height: ${height}`);
      modelRunnerState.modelRunner.resize_window(width, height);
    }
  }, [width, height, modelRunnerState]);

  useEffect(() => {
    console.log('monitoring', {modelRunnerState});
  }, [modelRunnerState]);

  // setup our keybindings
  useHotkeys('up', () => {
    if (modelRunnerState.initialized) {
      console.log('move model up');
      modelRunnerState.modelRunner.raise_model(10);
    }
  });
  useHotkeys('down', () => {
    if (modelRunnerState.initialized) {
      console.log('move model up');
      modelRunnerState.modelRunner.raise_model(-10);
    }
  });
  useHotkeys('left', () => {
    if (modelRunnerState.initialized) {
      console.log('move model left');
      modelRunnerState.modelRunner.shift_model(-10);
    }
  });
  useHotkeys('right', () => {
    if (modelRunnerState.initialized) {
      console.log('move model right');
      modelRunnerState.modelRunner.raise_model(10);
    }
  });
  /**
   * - Attaches event listeners to the canvas for interactive model control.
   * - Ensures the model and event listeners are properly cleaned up.
   */
  useEffect(() => {
    if (modelRunnerState.initialized && !initializingRef.current) {
      initializingRef.current = true;
      let isDragRotate = false;

      console.log('within conditional', {modelRunnerState});

      let handleHitDetection;
      let handleMouseMove;
      let handleMouseUp;
      let handleMouseDown;
      let handleWheel;

      const run = async () => {
        try {
          const canvas = document.getElementById('glyphx-cube-model');
          if (!canvas) {
            console.log('Canvas not found');
            return;
          }
          console.log('Canvas obtained in Model', {canvas});
          // // Call this function to resize the canvas whenever the window is resized
          // await modelRunnerState.modelRunner.run(1000, 1500);

          handleHitDetection = (e) => {
            // we substract the canvas position from the viewport position to get the values relative to the top left corner of the canvas
            const canvas = e.target.getBoundingClientRect();
            const x = e.clientX - canvas.left; // X position relative to the canvas
            const y = e.clientY - canvas.top; // Y position relative to the canvas
            console.log('Canvas in Hit detection', {canvas, x, y});
            console.log(`Clicked at: x=${x}, y=${y}`);
            modelRunnerState.modelRunner.select_glyph(x, y, false);
          };
          // Function to handle mouse down events on the canvas.
          handleMouseDown = () => {
            isDragRotate = true;
          };

          // Function to handle mouse move events on the canvas.
          handleMouseMove = (e) => {
            if (isDragRotate) {
              console.log('mouse move', e);
              modelRunnerState.modelRunner.add_yaw(-e.movementX);
              modelRunnerState.modelRunner.add_pitch(e.movementY);
            }
          };

          // Function to handle mouse up events on the canvas.
          handleMouseUp = () => {
            if (isDragRotate === true) {
              isDragRotate = false;
            }
          };

          // Function to handle wheel events on the canvas.
          handleWheel = (e) => {
            e.preventDefault();
            modelRunnerState.modelRunner.add_distance(-e.deltaY);
          };

          canvas.addEventListener('click', handleHitDetection);
          canvas.addEventListener('mousedown', handleMouseDown);
          canvas.addEventListener('mousemove', handleMouseMove);
          canvas.addEventListener('mouseup', handleMouseUp);
          canvas.addEventListener('wheel', handleWheel, {passive: false});
        } catch (error) {
          console.error('Failed to initialize mouse events:', error);
        }
      };

      run();
      // run().then(() => {
      //   initializingRef.current = false; // Reset the flag once initialization is complete
      // });

      // Clean-up function to remove event listeners and other potential states.
      return () => {
        const canvas = document.getElementById('glyphx-cube-model') as HTMLCanvasElement;
        if (canvas) {
          canvas.removeEventListener('click', handleHitDetection);
          canvas.removeEventListener('mousedown', handleMouseDown);
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseup', handleMouseUp);
          canvas.removeEventListener('wheel', handleWheel);
        }
        // remove resize listener
        // window.removeEventListener('resize', resizeCanvas);
        console.log('Cleanup done');
      };
    }
  }, [modelRunnerState, setModelRunnerState]);

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div
        ref={ref}
        id="glyphx-cube-model"
        className="flex items-center justify-center h-full w-full bg-[#414d66]"
      ></div>
    </div>
  );
};
