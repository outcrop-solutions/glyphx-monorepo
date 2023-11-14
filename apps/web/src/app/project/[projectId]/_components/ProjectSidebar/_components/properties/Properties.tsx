'use client';
/* eslint-disable no-lone-blocks */
import React, {useState} from 'react';
import {useRecoilValue} from 'recoil';
import {Property} from './Property';
import {propertiesSelector} from 'state';

export const Properties = () => {
  const properties = useRecoilValue(propertiesSelector);
  const [isCollapsed, setCollapsed] = useState(false);
  const [isDirty, setDirty] = useState(false);

  return (
    properties && (
      <React.Fragment>
        <div className="group">
          <summary
            onClick={() => {
              setCollapsed(!isCollapsed);
            }}
            className="flex h-8 items-center cursor-pointer justify-between w-full text-gray hover:bg-secondary-midnight hover:border-b-white hover:text-white truncate border-b border-gray"
          >
            <div className="flex mx-2 items-center w-full">
              <span className="">
                {/* @jp-burford it's sinful but it's functional for now so*/}
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
              <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
                {' '}
                Axes{' '}
              </span>
            </div>
            <button
              onClick={() => {}}
              className={`flex items-center ${
                !isDirty ? 'bg-gray' : 'bg-yellow'
              } justify-around px-3 text-xs mr-2 my-2 text-center rounded disabled:opacity-75 text-white`}
            >
              <span>Apply</span>
            </button>
            {/* <PlusIcon className="w-5 h-5 opacity-75 mr-1" /> */}
          </summary>
          {!isCollapsed && (
            <div className={`block border-b border-gray`}>
              <ul className="py-1 space-y-2">
                {Object.keys(properties)
                  .slice(0, 3)
                  .map((key) => (
                    <Property key={key} axis={key} setDirty={setDirty} />
                  ))}
              </ul>
            </div>
          )}
        </div>
      </React.Fragment>
    )
  );
};
