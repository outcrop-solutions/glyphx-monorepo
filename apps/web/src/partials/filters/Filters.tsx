import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Axes } from './Axes';
import { propertiesSelector } from 'state';

export const Filters = ({ handleDrop }) => {
  // TODO: change this to <summary></summary> html
  const [isCollapsed, setCollapsed] = useState(false);
  const properties = useRecoilValue(propertiesSelector);

  return (
    <React.Fragment>
      <div className="group">
        <summary className="flex h-8 items-center justify-between w-full text-gray hover:bg-secondary-midnight hover:text-white hover:border-b-white truncate border-b border-gray">
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
            <a>
              <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
                {' '}
                Filters{' '}
              </span>
            </a>
          </div>
        </summary>
        {!isCollapsed ? (
          <div
            className={`block border-b border-gray
        `}
          >
            <ul className={`overflow-auto py-1 w-full`}>
              {/* read only (no drag n drop) property filters */}
              {Object.keys(properties).map((key, idx) => (
                <Axes axis={key} handleDrop={handleDrop} />
              ))}
            </ul>
          </div>
        ) : (
          <></>
        )}
      </div>
    </React.Fragment>
  );
};
