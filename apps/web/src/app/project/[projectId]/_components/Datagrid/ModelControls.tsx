'use client';
import React, {useState} from 'react';
import {useRecoilValue} from 'recoil';
import {modelRunnerAtom, selectedGlyphsAtom} from 'state';
import {CameraIcon, HomeIcon, RefreshIcon} from '@heroicons/react/outline';
// @ts-ignore
import {ArrowDownIcon, ArrowLeftIcon, ArrowRightIcon, ArrowUpIcon, Move3D, OrbitIcon} from 'lucide-react';
// import {screenshotModel} from '../Model/utils';

export const ModelControls = () => {
  const modelRunnerState = useRecoilValue(modelRunnerAtom);
  const {desc, glyphId} = useRecoilValue(selectedGlyphsAtom);
  const [toggle, setToggle] = useState(true);
  return (
    modelRunnerState.initialized && (
      <>
        {/* home, axis, and snapshot controls */}
        <div className="absolute left-2 top-11 flex-col items-center space-y-2 z-[89] pt-2">
          <div
            onClick={modelRunnerState.initialized ? () => modelRunnerState.modelRunner.reset_camera() : () => {}}
            className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <HomeIcon className="h-5 w-5" />
          </div>
          <div
            onClick={modelRunnerState.initialized ? () => modelRunnerState.modelRunner.toggle_axis_lines() : () => {}}
            className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <Move3D className="h-5 w-5" />
          </div>
          <div
            onClick={modelRunnerState.initialized ? () => modelRunnerState.modelRunner.take_screenshot() : () => {}}
            className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <CameraIcon className="h-5 w-5" />
          </div>
          {/* <div
            onClick={() => modelRunnerState.modelRunner.run()}
            className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <RefreshIcon className="h-5 w-5" />
          </div> */}
        </div>
        {/* snap to perpective controls */}
        <div className="absolute left-1/2 top-11 transform -translate-x-1/2 flex items-center justify-between space-x-2 z-[9999] pt-2">
          <div
            onClick={modelRunnerState.initialized ? () => modelRunnerState.modelRunner.focus_on_x_axis() : () => {}}
            className="hover:bg-gray bg-secondary-blue rounded-full cursor-pointer p-1 h-8 w-8"
          >
            <div className="text-center text-sm">X</div>
          </div>
          <div
            onClick={modelRunnerState.initialized ? () => modelRunnerState.modelRunner.focus_on_z_axis() : () => {}}
            className="hover:bg-gray bg-secondary-blue cursor-pointer rounded-full p-1 h-8 w-8"
          >
            <div className="text-center text-sm">T</div>
          </div>
          <div
            onClick={modelRunnerState.initialized ? () => modelRunnerState.modelRunner.focus_on_y_axis() : () => {}}
            className="hover:bg-gray bg-secondary-blue cursor-pointer rounded-full p-1 h-8 w-8"
          >
            <div className="text-center text-sm">Y</div>
          </div>
        </div>
        {/* translation controls */}
        <div className="absolute right-2 top-11 flex-col items-center space-y-2 z-[9999] pt-2">
          <div
            onClick={() => setToggle((prev) => !prev)}
            className={`hover:bg-gray ${
              toggle ? 'bg-secondary-blue' : 'bg-gray'
            } rounded-full h-8 w-8 flex items-center justify-center cursor-pointer`}
          >
            <OrbitIcon className="h-5 w-5" />
          </div>
          <div
            onClick={
              modelRunnerState.initialized
                ? toggle
                  ? () => {
                      console.log('raise_model', 2);
                      modelRunnerState.modelRunner.raise_model(2);
                    }
                  : () => {
                      console.log('add_yaw', 2);
                      modelRunnerState.modelRunner.add_pitch(2);
                    }
                : () => {}
            }
            className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </div>
          <div
            onClick={
              modelRunnerState.initialized
                ? toggle
                  ? () => {
                      console.log('shift_model', -2);
                      modelRunnerState.modelRunner.shift_model(-2);
                    }
                  : () => {
                      console.log('add_pitch', -2);
                      modelRunnerState.modelRunner.add_yaw(-2);
                    }
                : () => {}
            }
            className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </div>
          <div
            onClick={
              modelRunnerState.initialized
                ? toggle
                  ? () => {
                      console.log('shift_model', 2);
                      modelRunnerState.modelRunner.shift_model(2);
                    }
                  : () => {
                      console.log('add_pitch', 2);
                      modelRunnerState.modelRunner.add_yaw(2);
                    }
                : () => {}
            }
            className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </div>
          <div
            onClick={
              modelRunnerState.initialized
                ? toggle
                  ? () => {
                      console.log('raise_model', -2);
                      modelRunnerState.modelRunner.raise_model(-2);
                    }
                  : () => {
                      console.log('add_yaw', -2);
                      modelRunnerState.modelRunner.add_pitch(-2);
                    }
                : () => {}
            }
            className="hover:bg-gray bg-secondary-blue rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <ArrowDownIcon className="h-5 w-5" />
          </div>
        </div>
        {/* display description */}
        {desc && desc.size > 0 && (
          <div className="absolute left-1/2 bottom-11 transform -translate-x-1/2 flex items-center space-x-2 z-[9999]">
            <div className="flex items-center justify-center cursor-pointer text-xs text-light-gray">
              X: {desc?.get('x')}
            </div>
            <div className="flex items-center justify-center cursor-pointer text-xs text-light-gray">
              Y: {desc?.get('y')}
            </div>
            <div className="flex items-center justify-center cursor-pointer text-xs text-light-gray">
              Z: {desc?.get('z')}
            </div>
          </div>
        )}
      </>
    )
  );
};
