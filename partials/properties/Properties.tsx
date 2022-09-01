/* eslint-disable no-lone-blocks */
import React, { useState } from "react";
import { Property } from "./Property";

export const Properties = ({ propertiesArr, handleDrop }) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <React.Fragment>
      <details open className="group">
        <summary className="flex h-11 items-center justify-between w-full text-slate-200 hover:text-white truncate border-b border-slate-400">
          <div className="flex ml-2 items-center">
            <span className="transition text-slate-400  duration-300 shrink-0 group-open:-rotate-180">
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <a>
              <span className="text-sm ml-3"> Properties </span>
            </a>
          </div>
          {/* <PlusIcon className="w-5 h-5 opacity-75 mr-1" /> */}
        </summary>
        <div className={`block border-b border-slate-400`}>
          <ul>
            {propertiesArr.length > 0
              ? propertiesArr.map(({ axis, accepts, lastDroppedItem }, idx) => {
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
