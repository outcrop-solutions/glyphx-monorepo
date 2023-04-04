/* eslint-disable no-lone-blocks */
import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Property } from './Property';
import { propertiesSelector } from 'state';
// import { propertiesSelector } from "state";

export const Properties = () => {
  const properties = useRecoilValue(propertiesSelector);
  return (
    <React.Fragment>
      <div className="group">
        <summary className="flex h-8 items-center justify-between w-full text-gray hover:bg-secondary-midnight hover:border-b-white hover:text-white truncate border-b border-gray">
          <div className="flex ml-2 items-center">
            <span className="">
              <svg className={`w-5 h-5 -rotate-90`} viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill="#CECECE"
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <a>
              <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
                {' '}
                Axes{' '}
              </span>
            </a>
          </div>
          {/* <PlusIcon className="w-5 h-5 opacity-75 mr-1" /> */}
        </summary>

        <div className={`block border-b border-gray`}>
          <ul className="py-1">
            {Object.keys(properties).map((key) => (
              <Property key={key} axis={key} />
            ))}
          </ul>
        </div>
      </div>
    </React.Fragment>
  );
};
