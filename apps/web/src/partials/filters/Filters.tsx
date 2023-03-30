import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Column } from './Column';
import { Axes } from './Axes';
import { filterQuerySelector } from 'state';

export const Filters = ({ handleDrop }) => {
  const [isCollapsed, setCollapsed] = useState(false);
  const filterQuery = useRecoilValue(filterQuerySelector);
  const properties = [];
  useEffect(() => {
    if (filterQuery) {
      try {
        //attempt to use Update Filter
        window.core.UpdateFilter(JSON.stringify(filterQuery));
      } catch (error) {}
    }
  }, [filterQuery]);

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
          {/* <PlusIcon className="w-5 h-5 opacity-75 mr-1" /> */}
        </summary>
        {!isCollapsed ? (
          <div
            className={`block border-b border-gray
        `}
          >
            <ul className={`overflow-auto py-1 w-full`}>
              {/* read only (no drag n drop) property filters */}
              {true
                ? properties.map(({ axis, accepts, lastDroppedItem }, idx) => {
                    if (idx < 3) {
                      return <Axes axis={axis} lastDroppedItem={lastDroppedItem} key={idx} />;
                    } else {
                      return (
                        <Column
                          axis={axis}
                          accept={accepts}
                          lastDroppedItem={lastDroppedItem}
                          onDrop={(item) => handleDrop(idx, item)}
                          key={idx}
                          idx={idx}
                        />
                      );
                    }
                  })
                : null}
            </ul>
          </div>
        ) : (
          <></>
        )}
      </div>
    </React.Fragment>
  );
};
