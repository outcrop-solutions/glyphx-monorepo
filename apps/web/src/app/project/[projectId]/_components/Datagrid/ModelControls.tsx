'use client';
import React, {useEffect, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {rowIdsAtom, lastSelectedGlyphAtom, descSelector, modelRunnerAtom} from 'state';
import {CameraIcon, HomeIcon} from '@heroicons/react/outline';
// @ts-ignore
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  MinusIcon,
  Move3D,
  OrbitIcon,
  PlusIcon,
} from 'lucide-react';
// import {screenshotModel} from '../Model/utils';

export const ModelControls = () => {
  const modelRunner = useRecoilValue(modelRunnerAtom);
  const rowIds = useRecoilValue(rowIdsAtom);
  const {xValue, yValue, zValue} = useRecoilValue(descSelector);
  const {desc} = useRecoilValue(lastSelectedGlyphAtom);
  const [toggle, setToggle] = useState(true); // true

  const handleCamera = () => {
    const cameraType = toggle ? 'Orbital' : 'Perspective';
    modelRunner.set_camera_type(cameraType);
    setToggle((prev) => !prev);
  };

  useEffect(() => {
    const toggleCamera = (event) => {
      console.log({event});
    };
    // Register the event listener
    window.addEventListener('CameraTypeChanged', toggleCamera);
    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('CameraTypeChanged', toggleCamera);
    };
  }, []);

  return (
    <>
      {/* home, axis, and snapshot controls */}
      <div className="absolute left-2 top-11 flex-col items-center space-y-2 z-[89] pt-2">
        <div
          onClick={() => modelRunner.reset_camera()}
          className="hover:bg-gray transparent border border-gray rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
        >
          <HomeIcon className="h-5 w-5" />
        </div>
        <div
          onClick={() => modelRunner.toggle_axis_lines()}
          className="hover:bg-gray transparent border border-gray rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
        >
          <Move3D className="h-5 w-5" />
        </div>
        <div
          onClick={() => modelRunner.take_screenshot(false)}
          className="hover:bg-gray transparent border border-gray rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
        >
          <CameraIcon className="h-5 w-5" />
        </div>
        {/* <div
            onClick={() => modelRunner.run()}
            className="hover:bg-gray transparent border border-gray rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <RefreshIcon className="h-5 w-5" />
          </div> */}
      </div>
      {/* snap to perpective controls */}
      <div className="absolute left-1/2 top-11 transform -translate-x-1/2 flex items-center justify-between space-x-2 z-[89] pt-2">
        <div
          onClick={() => modelRunner.focus_on_x_axis()}
          className="hover:bg-gray transparent border border-gray rounded-full cursor-pointer p-1 h-8 w-8"
        >
          <div className="text-center text-sm">X</div>
        </div>
        <div
          onClick={() => modelRunner.focus_on_z_axis()}
          className="hover:bg-gray transparent border border-gray cursor-pointer rounded-full p-1 h-8 w-8"
        >
          <div className="text-center text-sm">T</div>
        </div>
        <div
          onClick={() => modelRunner.focus_on_y_axis()}
          className="hover:bg-gray transparent border border-gray cursor-pointer rounded-full p-1 h-8 w-8"
        >
          <div className="text-center text-sm">Y</div>
        </div>
      </div>
      {/* translation controls */}
      <div className="absolute right-2 top-11 flex-col items-center space-y-2 z-[89] pt-2">
        <div className="relative flex items-center gap-x-2">
          <div
            onClick={() => modelRunner.add_distance(-10)}
            className="hover:bg-slate-400 active:bg-gray border border-gray rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <PlusIcon className="h-5 w-5" />
          </div>
          <div
            onClick={() => modelRunner.add_distance(10)}
            className="hover:bg-slate-400 active:bg-gray border border-gray rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <MinusIcon className="h-5 w-5" />
          </div>
          <div
            onClick={handleCamera}
            className={`hover:bg-gray ${
              toggle ? 'transparent border border-gray' : 'bg-gray'
            } rounded-full h-8 w-8 flex items-center justify-center cursor-pointer`}
          >
            <OrbitIcon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-y-2">
          <div
            onClick={
              toggle
                ? () => {
                    console.log('raise_model', 2);
                    modelRunner.raise_model(2);
                  }
                : () => {
                    console.log('add_yaw', 2);
                    modelRunner.add_pitch(2);
                  }
            }
            className="hover:bg-slate-400 active:bg-gray transparent border border-gray rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <ArrowUpIcon className="h-5 w-5" />
          </div>
          <div
            onClick={
              toggle
                ? () => {
                    console.log('shift_model', -2);
                    modelRunner.shift_model(-2);
                  }
                : () => {
                    console.log('add_pitch', -2);
                    modelRunner.add_yaw(-2);
                  }
            }
            className="hover:bg-slate-400 active:bg-gray transparent border border-gray rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </div>
          <div
            onClick={
              toggle
                ? () => {
                    console.log('shift_model', 2);
                    modelRunner.shift_model(2);
                  }
                : () => {
                    console.log('add_pitch', 2);
                    modelRunner.add_yaw(2);
                  }
            }
            className="hover:bg-slate-400 active:bg-gray transparent border border-gray rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <ArrowRightIcon className="h-5 w-5" />
          </div>
          <div
            onClick={
              toggle
                ? () => {
                    console.log('raise_model', -2);
                    modelRunner.raise_model(-2);
                  }
                : () => {
                    console.log('add_yaw', -2);
                    modelRunner.add_pitch(-2);
                  }
            }
            className="hover:bg-slate-400 active:bg-gray transparent border border-gray rounded-full h-8 w-8 flex items-center justify-center cursor-pointer"
          >
            <ArrowDownIcon className="h-5 w-5" />
          </div>
        </div>
      </div>
      {/* display description */}
      {desc && desc.size > 0 && (
        <div className="absolute left-1/2 bottom-11 transform -translate-x-1/2 flex items-center space-x-2 z-[89]">
          {rowIds && rowIds?.length > 1 && (
            <div className="flex items-center text-xs text-light-gray whitespace-nowrap">Last Selected Glyph:</div>
          )}
          <div className="flex items-center justify-center cursor-pointer text-xs text-light-gray whitespace-nowrap">
            X: {xValue}
          </div>
          <div className="flex items-center justify-center cursor-pointer text-xs text-light-gray whitespace-nowrap">
            Y: {yValue}
          </div>
          <div className="flex items-center justify-center cursor-pointer text-xs text-light-gray whitespace-nowrap">
            Z: {zValue}
          </div>
        </div>
      )}
    </>
  );
};
