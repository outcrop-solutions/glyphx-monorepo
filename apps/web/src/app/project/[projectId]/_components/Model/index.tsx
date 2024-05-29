'use client';
import React, {useEffect, useRef} from 'react';
import {useRecoilState} from 'recoil';
import {modelRunnerAtom} from 'state';
import {useHotkeys} from 'react-hotkeys-hook';

export const Model = () => {
  const [modelRunnerState, setModelRunnerState] = useRecoilState(modelRunnerAtom);
  const initializingRef = useRef(false); // Reference to track whether mouse events have been setup

  useEffect(() => {
    console.log('monitoring', {modelRunnerState});
  }, [modelRunnerState]);

  // setup our keybindings
  useHotkeys('up', () => {
    console.log('move model up');
    modelRunnerState.modelRunner.raise_model(10);
  });
  useHotkeys('down', () => {
    console.log('move model up');
    modelRunnerState.modelRunner.raise_model(-10);
  });
  useHotkeys('left', () => {
    console.log('move model left');
    modelRunnerState.modelRunner.shift_model(-10);
  });
  useHotkeys('right', () => {
    console.log('move model right');
    modelRunnerState.modelRunner.raise_model(10);
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

      // Update the canvas size to maintain the aspect ratio and fit its container
      const resizeCanvas = () => {
        const canvas = document.getElementById('cube_model') as HTMLCanvasElement;
        const container = canvas?.parentElement;
        if (container) {
          // Use clientWidth and clientHeight for the container's size, which includes padding
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;

          // Calculate the aspect ratio of the canvas
          const aspectRatio = canvas.width / canvas.height;

          // Calculate the new dimensions while maintaining the aspect ratio
          let newWidth, newHeight;
          if (containerWidth / containerHeight > aspectRatio) {
            newHeight = containerHeight;
            newWidth = containerHeight * aspectRatio;
          } else {
            newWidth = containerWidth;
            newHeight = containerWidth / aspectRatio;
          }

          // Set the canvas dimensions in CSS to scale it properly
          canvas.style.width = `${newWidth}px`;
          canvas.style.height = `${newHeight}px`;
        }
      };

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
          console.log('Canvas obtained', canvas);

          // Call this function to resize the canvas whenever the window is resized
          window.addEventListener('resize', resizeCanvas);
          // Initial resize on load
          resizeCanvas();

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

          canvas.addEventListener('mousedown', handleMouseDown);
          canvas.addEventListener('mousemove', handleMouseMove);
          canvas.addEventListener('mouseup', handleMouseUp);
          canvas.addEventListener('wheel', handleWheel, {passive: false});

          // await modelRunner.run();
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
        const canvas = document.getElementById('glyphx-cube-model');
        if (canvas) {
          canvas.removeEventListener('mousedown', handleMouseDown);
          canvas.removeEventListener('mousemove', handleMouseMove);
          canvas.removeEventListener('mouseup', handleMouseUp);
          canvas.removeEventListener('wheel', handleWheel);
        }
        // remove resize listener
        window.removeEventListener('resize', resizeCanvas);
        console.log('Cleanup done');
      };
    }
  }, [modelRunnerState, setModelRunnerState]);

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      <div id="glyphx-cube-model" className="h-full w-full bg-[#414d66]"></div>
    </div>
  );
};
