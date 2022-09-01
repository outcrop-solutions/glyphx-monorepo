import React, { useState, useEffect } from "react";
import { Column } from "./Column";
import { Axes } from "./Axes";
import { useFilterChange } from "services/useFilterChange";

export const Filters = ({
  setQuery,
  filtersApplied,
  setFiltersApplied,
  sidebarExpanded,
  setSidebarExpanded,
  propertiesArr,
  setPropertiesArr,
  handleDrop,
  projectId,
  sdt,
}) => {
  const [open, setOpen] = useState(true);

  useFilterChange(filtersApplied, projectId, sdt, propertiesArr, setQuery);

  const handleClick = () => {
    setOpen((prev) => !prev);
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
              <span className="text-sm ml-3"> Filters </span>
            </a>
          </div>
          {/* <PlusIcon className="w-5 h-5 opacity-75 mr-1" /> */}
        </summary>

        <div
          className={`block border-b border-slate-400
        `}
        >
          <ul className={`overflow-auto ${!open && "hidden"}`}>
            {/* read only (no drag n drop) property filters */}
            {propertiesArr.length > 0
              ? propertiesArr.map(({ axis, accepts, lastDroppedItem }, idx) => {
                  if (idx < 3) {
                    return (
                      <Axes
                        filtersApplied={filtersApplied}
                        setFiltersApplied={setFiltersApplied}
                        axis={axis}
                        setPropertiesArr={setPropertiesArr}
                        lastDroppedItem={lastDroppedItem}
                        key={idx}
                      />
                    );
                  } else {
                    return (
                      <Column
                        filtersApplied={filtersApplied}
                        setFiltersApplied={setFiltersApplied}
                        setPropertiesArr={setPropertiesArr}
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
      </details>
    </React.Fragment>
  );
};
