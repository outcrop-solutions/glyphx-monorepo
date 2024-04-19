'use client';
import React, {useEffect, useRef, useState} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {isRenderedAtom, modelRunnerAtom} from 'state';
import init, {ModelRunner} from '../../../../../../public/pkg/glyphx_cube_model';

export const Model = () => {
  const [modelRunnerState, setModelRunnerState] = useRecoilState(modelRunnerAtom);
  const initializingRef = useRef(false); // Reference to track initialization progress
  const [style, _] = useState({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'solid 1px #595E68',
    background: 'transparent',
    height: '100%',
    width: '100%',
  });

  useEffect(() => {
    console.log('monitoring', {modelRunnerState});
  }, [modelRunnerState]);

  /**
   * Initializes and manages the WebGL model on the canvas.
   * - Loads the WASM module and creates an instance of ModelRunner.
   * - Sets the modelRunner into the Recoil state for global access.
   * - Attaches event listeners to the canvas for interactive model control.
   * - Ensures the model and event listeners are properly cleaned up.
   */
  useEffect(() => {
    if (!modelRunnerState.initialized && !initializingRef.current) {
      initializingRef.current = true;
      let isDragRotate = false;
      console.log('within conditional', {modelRunnerState});

      // Function to handle mouse down events on the canvas.
      const handleMouseDown = () => {
        isDragRotate = true;
      };

      // Function to handle mouse move events on the canvas.
      const handleMouseMove = (e) => {
        if (isDragRotate) {
          modelRunner.add_yaw(-e.movementX);
          modelRunner.add_pitch(e.movementY);
        }
      };

      // Function to handle mouse up events on the canvas.
      const handleMouseUp = () => {
        if (isDragRotate === true) {
          isDragRotate = false;
        }
      };

      // Function to handle wheel events on the canvas.
      const handleWheel = (e) => {
        e.preventDefault();
        modelRunner.add_distance(-e.deltaY);
      };

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

      const run = async () => {
        try {
          // Load the WASM module and create a new ModelRunner instance.
          await init();
          console.log('WASM Loaded');
          const modelRunner = new ModelRunner();
          console.log('ModelRunner created');
          setModelRunnerState({initialized: true, modelRunner});

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

          canvas.addEventListener('mousedown', handleMouseDown);
          canvas.addEventListener('mousemove', handleMouseMove);
          canvas.addEventListener('mouseup', handleMouseUp);
          canvas.addEventListener('wheel', handleWheel, {passive: false});

          await modelRunner.run();
        } catch (error) {
          console.error('Failed to initialize or run modelRunner:', error);
        }
      };

      run().then(() => {
        initializingRef.current = false; // Reset the flag once initialization is complete
      });

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

        //TODO: do we need to clean up th model?
        // if (modelRunner && modelRunner.dispose) {
        //   modelRunner.dispose();
        // }
        console.log('Cleanup done');
      };
    }
    // It's crucial to keep the dependency array empty to avoid re-running this effect unnecessarily.
  }, [modelRunnerState, setModelRunnerState]);

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {/* <Resizable minHeight={600} style={style}> */}
      <div id="glyphx-cube-model" className="h-full w-full bg-[#414d66]"></div>
      {/* </Resizable> */}
    </div>
  );
};
