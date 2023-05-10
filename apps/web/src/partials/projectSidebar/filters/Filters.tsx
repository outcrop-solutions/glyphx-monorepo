import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Axes } from './Axes';
import { propertiesSelector, showLoadingAtom } from 'state';
import Button from 'components/Button';

export const Filters = () => {
  const properties = useRecoilValue(propertiesSelector);
  const showLoading = useRecoilValue(showLoadingAtom);
  const [isCollapsed, setCollapsed] = useState(false);

  const isLoading = Object.keys(showLoading).length > 0;
  return (
    properties && (
      <React.Fragment>
        <div className="group">
          <summary
            onClick={() => {
              setCollapsed(!isCollapsed);
            }}
            className="flex h-8 items-center cursor-pointer justify-between w-full text-gray hover:bg-secondary-midnight hover:text-white hover:border-b-white truncate border-b border-gray"
          >
            <div className="flex items-center w-full mx-2">
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
              <a>
                <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
                  {' '}
                  Filters{' '}
                </span>
              </a>
            </div>
            <button
              disabled={isLoading}
              className="flex items-center bg-gray hover:bg-yellow justify-around px-3 text-xs mr-2 my-2 text-center rounded disabled:opacity-75 text-white"
            >
              <span>Apply</span>
            </button>
          </summary>
          {!isCollapsed && (
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
          )}
        </div>
      </React.Fragment>
    )
  );
};
