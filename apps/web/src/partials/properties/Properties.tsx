/* eslint-disable no-lone-blocks */
import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Property } from './Property';
import { propertiesSelector } from 'state';
// import { propertiesSelector } from "state";
import MenuChevronIcon from 'public/svg/menu-chevron-icon.svg';
export const Properties = () => {
  const properties = useRecoilValue(propertiesSelector);
  return (
    <React.Fragment>
      <div className="group">
        <summary className="flex h-8 items-center justify-between w-full text-gray hover:bg-secondary-midnight hover:border-b-white hover:text-white truncate border-b border-gray">
          <div className="flex ml-2 items-center">
            <span className="">
              <MenuChevronIcon />
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
            {Object.keys(properties)
              .slice(0, 3)
              .map((key) => (
                <Property key={key} axis={key} />
              ))}
          </ul>
        </div>
      </div>
    </React.Fragment>
  );
};
