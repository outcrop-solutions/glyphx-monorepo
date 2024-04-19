'use client';
import React, {useState} from 'react';
import {useRecoilValue} from 'recoil';
import {modelRunnerAtom} from 'state';

export const Controls = () => {
  const [isCollapsed, setCollapsed] = useState(false);
  const modelRunner = useRecoilValue(modelRunnerAtom);

  return (
    modelRunner && (
      <div className="group flex flex-col grow">
        <summary className="flex h-8 items-center cursor-pointer justify-between w-full text-gray hover:text-white hover:border-b-white hover:bg-secondary-midnight truncate border-b border-gray z-10">
          <div
            onClick={() => {
              setCollapsed(!isCollapsed);
            }}
            className="flex ml-2 items-center"
          >
            <span className="">
              <svg
                className={`w-5 h-5 ${isCollapsed ? '-rotate-90' : 'rotate-180'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill="#CECECE"
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div>
              <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
                {' '}
                Model Controls{' '}
              </span>
            </div>
          </div>
        </summary>
        {!isCollapsed && (
          <div className="px-1 space-y-2 py-2 border-b border-gray">
            <div className="flex items-center space-x-2">
              <div
                id="move-left-button"
                onClick={() => {
                  modelRunner.add_yaw(-5.0);
                }}
                className="bg-nav rounded h-5 text-xs w-full px-1 flex items-center justify-center cursor-pointer"
              >
                Left
              </div>
              <div
                id="move-right-button"
                onClick={() => {
                  modelRunner.add_yaw(5.0);
                }}
                className="bg-nav rounded h-5 text-xs w-full px-1 flex items-center justify-center cursor-pointer"
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
                className="bg-nav rounded h-5 text-xs w-full px-1 flex items-center justify-center cursor-pointer"
              >
                Forward
              </div>
              <div
                id="move-backward-button"
                onClick={() => {
                  modelRunner.add_distance(120.0);
                }}
                className="bg-nav rounded h-5 text-xs w-full px-1 flex items-center justify-center cursor-pointer"
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
                className="bg-nav rounded h-5 text-xs w-full px-1 flex items-center justify-center cursor-pointer"
              >
                Up
              </div>
              <div
                id="move-down-button"
                onClick={() => {
                  modelRunner.add_pitch(5.0);
                }}
                className="bg-nav rounded h-5 text-xs w-full px-1 flex items-center justify-center cursor-pointer"
              >
                Down
              </div>
            </div>
          </div>
        )}
      </div>
    )
  );
};
