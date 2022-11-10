import React from "react";
import { Column } from "./Column";
import { Axes } from "./Axes";
import { useFilterChange } from "services/useFilterChange";
import { propertiesAtom } from "@/state/properties";
import { useRecoilValue } from "recoil";

export const Filters = ({ handleDrop }) => {
  const properties = useRecoilValue(propertiesAtom);
  // TODO: UNCOMMENT THIS AND WORK ON FILTERS FOR PRODUCTION
  // useFilterChange();

  return (
    <React.Fragment>
      <div className="group">
        <summary className="flex h-11 items-center justify-between w-full text-gray hover:bg-secondary-midnight hover:text-white truncate border-b border-gray">
          <div className="flex ml-2 items-center">
            <span className="transition text-gray  duration-300 shrink-0 group-open:-rotate-180">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill="#CECECE"
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <a>
              <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray"> Filters </span>
            </a>
          </div>
          {/* <PlusIcon className="w-5 h-5 opacity-75 mr-1" /> */}
        </summary>
        <div
          className={`block border-b border-gray
        `}
        >
          <ul className={`overflow-auto`}>
            {/* read only (no drag n drop) property filters */}
            {properties?.length > 0
              ? properties.map(({ axis, accepts, lastDroppedItem }, idx) => {
                  if (idx < 3) {
                    return (
                      <Axes
                        axis={axis}
                        lastDroppedItem={lastDroppedItem}
                        key={idx}
                      />
                    );
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
      </div>
    </React.Fragment>
  );
};
