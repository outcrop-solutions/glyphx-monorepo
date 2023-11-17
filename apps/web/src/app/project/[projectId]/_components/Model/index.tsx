'use client';
import React, {useEffect, useState} from 'react';
import {Resizable} from 're-resizable';
import Script from 'next/script';
import {useRecoilValue} from 'recoil';
import {isRenderedAtom} from 'state';
import {ModelFooter} from '../Datagrid';

export const Model = () => {
  const isRendered = useRecoilValue(isRenderedAtom);
  const [canvasReady, setCanvasReady] = useState(false);
  const [style, _] = useState({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'solid 1px #595E68',
    background: 'transparent',
    height: '100%',
    width: '100%',
  });

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

  useEffect(() => {
    if (isRendered && !canvasReady) {
      // Execute this once the component is rendered and the script is loaded
      setCanvasReady(true);
    }
  }, [isRendered, canvasReady, setCanvasReady]);

  useEffect(() => {
    if (canvasReady) {
      // Call this function to resize the canvas whenever the window is resized
      window.addEventListener('resize', resizeCanvas);

      // Initial resize on load
      resizeCanvas();
    }

    // Cleanup listener when the component is unmounted or canvas is not ready
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [canvasReady]);

  return (
    <div className="relative h-full w-full flex items-center justify-center">
      {isRendered && (
        <Script strategy="lazyOnload" id="run-model" type="module">
          {`import init, { ModelRunner } from '/pkg/glyphx_cube_model.js';
      async function run() {
	let isDragRotate = false;
        await init();
        console.log('WASM Loaded');
        const modelRunner = new ModelRunner();

        console.log('ModelRunner created');
	
	
        const canvas = document.getElementById('glyphx-cube-model');

            canvas.addEventListener('mousedown', e => {
                isDragRotate = true;
            });

            canvas.addEventListener('mousemove', e => {
                if (isDragRotate === true) {
		    //Here we invert our x and y to get the rotation to match
		    const rotation = -e.movementX;
                     modelRunner.add_yaw(rotation);
		     modelRunner.add_pitch(e.movementY);

                }
            });

            canvas.addEventListener('mouseup', e => {
                if (isDragRotate === true) {
                    isDragRotate = false;
                }
            });

            canvas.addEventListener('wheel', e => {
		console.log("wheel event");
                e.preventDefault();
		modelRunner.add_distance(-e.deltaY);
            }, true);

	
	// Get the button element
        const moveLeftButton = document.getElementById('move-left-button');
        const moveRightButton = document.getElementById('move-right-button');
        const moveForwardButton = document.getElementById('move-forward-button');
        const moveBackwardButton = document.getElementById('move-backward-button');
        const moveUpButton = document.getElementById('move-up-button');
        const moveDownButton = document.getElementById('move-down-button');

          moveLeftButton.addEventListener('click', function onClick() {
          console.log('Move Left Button Clicked');

          modelRunner.add_yaw(-5.0);
        });

        moveRightButton.addEventListener('click', function onClick() {
          console.log('Move Right Button Clicked');

          modelRunner.add_yaw(5.0);
        });

        moveForwardButton.addEventListener('click', function onClick() {
          console.log('Move Forward Button Clicked');

          modelRunner.add_distance(-120.0);
        });

        moveBackwardButton.addEventListener('click', function onClick() {
          console.log('Move Backward Button Clicked');

          modelRunner.add_distance(120.0);
        });

        moveUpButton.addEventListener('click', function onClick() {
          console.log('Move Up Button Clicked');

          modelRunner.add_pitch(-5.0);
        });

        moveDownButton.addEventListener('click', function onClick() {
          console.log('Move Down Button Clicked');

          modelRunner.add_pitch(5.0);
        });
        window.addEventListener('model-event', (event) => {
          console.log('Model Event Received');
          console.log({ event });
        });

        await modelRunner.run();
      }
      run();`}
        </Script>
      )}
      {/* <Resizable minHeight={600} style={style}> */}
      <div id="glyphx-cube-model" className="h-full w-full bg-[#414d66]"></div>
      {/* </Resizable> */}
    </div>
  );
};
