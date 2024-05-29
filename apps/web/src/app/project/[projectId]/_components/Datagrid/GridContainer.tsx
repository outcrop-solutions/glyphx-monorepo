'use client';
import React, {useEffect, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {MainDropzone} from '../ProjectSidebar/_components/files';
import {Datagrid} from './DataGrid';
import {GridHeader} from './GridHeader';
import {ModelFooter} from './ModelFooter';

import {filesOpenSelector} from 'state/files';
import {useResize} from 'services/useResize';
import {modelRunnerAtom, orientationAtom, projectAtom, splitPaneSizeAtom, stateSelector, windowSizeAtom} from 'state';
import SplitPane from 'react-split-pane';
import {Model} from '../Model';
import {CameraIcon, HomeIcon, RefreshIcon} from '@heroicons/react/outline';
import {Move3D} from 'lucide-react';

export const GridContainer = () => {
  // ensures we don't pre-render the server
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const modelRunnerState = useRecoilValue(modelRunnerAtom);

  const openFiles = useRecoilValue(filesOpenSelector);
  const activeState = useRecoilValue(stateSelector);
  const project = useRecoilValue(projectAtom);
  const orientation = useRecoilValue(orientationAtom);
  const {height} = useRecoilValue(windowSizeAtom);
  const {handlePaneResize, defaultSize, maxSize, minSize, split} = useResize();
  const resize = useRecoilValue(splitPaneSizeAtom);

  const getPaneHeight = () => {
    if (height) {
      if (orientation === 'vertical') {
        return height - 60;
      } else {
        return height - 70;
      }
    }
  };

  const handleCapture = () => {
    const canvas = document.getElementById('cube_model') as HTMLCanvasElement;
    const gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true});

    if (!gl) {
      console.error('Unable to obtain WebGL context');
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    const pixels = new Uint8Array(width * height * 4);

    requestAnimationFrame(() => {
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      if (pixels.some((byte) => byte !== 0)) {
        console.log('Data captured!');

        // WebGL's coordinate system starts from the bottom left corner, while the typical image and canvas coordinate systems start from the top left corner. To correct this, you need to flip the image data vertically after capturing it but before using it

        // Flip the image data vertically
        const flippedPixels = new Uint8Array(width * height * 4);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            for (let c = 0; c < 4; c++) {
              flippedPixels[(x + (height - 1 - y) * width) * 4 + c] = pixels[(x + y * width) * 4 + c];
            }
          }
        }

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempContext = tempCanvas.getContext('2d');
        const imageData = new ImageData(new Uint8ClampedArray(flippedPixels), width, height);
        tempContext?.putImageData(imageData, 0, 0);

        // Download or use the image data as needed
        const dataUrl = tempCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'canvas-screenshot.png';
        link.click();
      } else {
        console.log('No data captured, trying again...');
        requestAnimationFrame(handleCapture); // Try again
      }
    });
  };

  return (
    isClient && (
      <div className="relative h-full w-full border-r border-gray">
        <ModelFooter />
        {/* @ts-ignore */}
        <SplitPane
          style={{overflow: 'scroll', height: `${getPaneHeight()}px`}}
          key={resize}
          split={split()}
          allowResize={true}
          defaultSize={defaultSize()}
          maxSize={maxSize()} // window.innerHeght - headers
          minSize={minSize()} // needed to always show col headers
          onChange={handlePaneResize}
          primary={'first'}
        >
          <div className="flex flex-col w-full h-full">
            {openFiles?.length > 0 ? (
              <>
                <GridHeader />
                <Datagrid />
              </>
            ) : (
              <MainDropzone />
            )}
          </div>

          {/* <div className={`${orientation === 'vertical' ? 'w-full' : 'h-2/3 w-2/3'} object-scale-down p-20 mx-auto`}> */}
          <div className="h-full w-full relative">
            <div className="absolute left-2 top-12 flex-col items-center space-y-2 z-[9999] pt-2">
              <div
                onClick={() => modelRunnerState.modelRunner.reset_camera()}
                className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
              >
                <HomeIcon className="h-5 w-5" />
              </div>
              <div
                onClick={() => modelRunnerState.modelRunner.toggle_axis_lines()}
                className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
              >
                <Move3D className="h-5 w-5" />
              </div>
              <div
                onClick={handleCapture}
                className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
              >
                <CameraIcon className="h-5 w-5" />
              </div>
              <div
                onClick={() => modelRunnerState.modelRunner.run()}
                className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
              >
                <RefreshIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="absolute left-1/2 transform -translate-x-1/2 top-12 flex items-center justify-between space-x-2 z-[9999] pt-2">
              <div
                onClick={() => modelRunnerState.modelRunner.focus_on_x_axis()}
                className="hover:bg-gray bg-secondary-blue rounded-full p-1 h-8 w-8"
              >
                <div className="text-center text-sm">X</div>
              </div>
              <div
                onClick={() => modelRunnerState.modelRunner.focus_on_z_axis()}
                className="hover:bg-gray bg-secondary-blue rounded-full p-1 h-8 w-8"
              >
                <div className="text-center text-sm">T</div>
              </div>
              <div
                onClick={() => modelRunnerState.modelRunner.focus_on_y_axis()}
                className="hover:bg-gray bg-secondary-blue rounded-full p-1 h-8 w-8"
              >
                <div className="text-center text-sm">Y</div>
              </div>
            </div>
            <Model />
          </div>

          {/* <Image
                src={
                  activeState?.imageHash
                    ? `data:image/png;base64,${activeState.imageHash}`
                    : project.imageHash && `data:image/png;base64,${project.imageHash}`
                }
                width={
                  activeState?.aspectRatio?.width ? activeState?.aspectRatio?.width : project?.aspectRatio?.width || 300
                }
                height={
                  activeState?.aspectRatio?.height
                    ? activeState?.aspectRatio?.height
                    : project?.aspectRatio?.height || 200
                }
                alt="model"
              /> */}
          {/* </div> */}
        </SplitPane>
      </div>
    )
  );
};
