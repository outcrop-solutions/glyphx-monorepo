/* eslint-disable no-lone-blocks */
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import { propertiesAtom } from "@/state/properties";
import { Property } from "./Property";

export const Properties = ({ handleDrop }) => {
  const [properties, setProperties] = useRecoilState(propertiesAtom);

  return (
    <React.Fragment>
      <details open className="group">
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
              <span className="text-sm ml-3 text-white"> Axes </span>
            </a>
          </div>
          {/* <PlusIcon className="w-5 h-5 opacity-75 mr-1" /> */}
        </summary>
        <div className={`block border-b border-gray`}>
          <ul>
            {properties?.length > 0
              ? properties.map(({ axis, accepts, lastDroppedItem }, idx) => {
                  if (idx < 3) {
                    return (
                      <Property
                        axis={axis}
                        accept={accepts}
                        lastDroppedItem={lastDroppedItem}
                        onDrop={(item) => handleDrop(idx, item)}
                        key={idx}
                      />
                    );
                  } else return null;
                })
              : null}
          </ul>
        </div>
      </details>
    </React.Fragment>
  );
};
