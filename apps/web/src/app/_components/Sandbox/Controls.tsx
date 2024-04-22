'use client';
import React from 'react';
import {useRecoilValue} from 'recoil';
import {modelRunnerAtom} from 'state';

// OLD COMPONENT
export const Controls = () => {
  const {modelRunner, initialized} = useRecoilValue(modelRunnerAtom);

  // TODO:
  return (
    initialized && (
      <div className="space-y-2 mb-4">
        <div className="text-white">Controls</div>
        <div className="flex items-center space-x-2">
          <div
            id="move-left-button"
            onClick={() => {
              modelRunner.add_yaw(-5.0);
            }}
            className="bg-yellow rounded h-full w-full px-1 flex items-center justify-center cursor-pointer"
          >
            Left
          </div>
          <div
            onClick={() => {
              modelRunner.add_yaw(5.0);
            }}
            id="move-right-button"
            className="bg-yellow h-full w-full rounded px-1 flex items-center justify-center cursor-pointer"
          >
            Right
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            id="move-forward-button"
            onClick={() => {
              modelRunner.add_distance(-120.0);
            }}
            className="bg-yellow rounded h-full w-full px-1 flex items-center justify-center cursor-pointer"
          >
            Forward
          </div>
          <div
            id="move-backward-button"
            onClick={() => {
              modelRunner.add_distance(120.0);
            }}
            className="bg-yellow rounded h-full w-full px-1 flex items-center justify-center cursor-pointer"
          >
            Backward
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div
            id="move-up-button"
            onClick={() => {
              modelRunner.add_pitch(-5.0);
            }}
            className="bg-yellow rounded h-full w-full px-1 flex items-center justify-center cursor-pointer"
          >
            Up
          </div>
          <div
            id="move-down-button"
            onClick={() => {
              modelRunner.add_pitch(5.0);
            }}
            className="bg-yellow rounded h-full w-full px-1 flex items-center justify-center cursor-pointer"
          >
            Down
          </div>
        </div>
      </div>
    )
  );
};
