import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Axes } from './Axes';
import { propertiesSelector } from 'state';
import MenuChevronIcon from 'public/svg/menu-chevron-icon.svg';

export const Filters = () => {
  // TODO: change this to <summary></summary> html
  const properties = useRecoilValue(propertiesSelector);

  return (
    properties && (
      <React.Fragment>
        <div className="group">
          <summary className="flex h-8 items-center justify-between w-full text-gray hover:bg-secondary-midnight hover:text-white hover:border-b-white truncate border-b border-gray">
            <div className="flex ml-2 items-center">
              <span className="">
                <MenuChevronIcon />
              </span>
              <a>
                <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
                  {' '}
                  Filters{' '}
                </span>
              </a>
            </div>
          </summary>

          <div
            className={`block border-b border-gray
        `}
          >
            <ul className={`overflow-auto py-1 w-full`}>
              {/* read only (no drag n drop) property filters */}
              {Object.keys(properties).map((key) => (
                <Axes key={key} axis={key} />
              ))}
            </ul>
          </div>
        </div>
      </React.Fragment>
    )
  );
};
