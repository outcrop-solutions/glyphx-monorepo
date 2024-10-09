'use client';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {modelRunnerAtom} from 'state';
import {CameraIcon, HomeIcon, RefreshIcon} from '@heroicons/react/outline';
// @ts-ignore
import {Move3D} from 'lucide-react';
// import {screenshotModel} from '../Model/utils';

export const ModelControls = () => {
  const modelRunnerState = useRecoilValue(modelRunnerAtom);
  // console.log({...modelRunnerState, controls: true});
  return (
    modelRunnerState.initialized && (
      <>
        <div className="absolute left-2 top-11 flex-col items-center space-y-2 z-[9999] pt-2">
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
            // onClick={screenshotModel}
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
        <div className="absolute left-1/2 top-11 transform -translate-x-1/2 flex items-center justify-between space-x-2 z-[9999] pt-2">
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
      </>
    )
  );
};
