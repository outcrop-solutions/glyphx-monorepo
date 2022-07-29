import React, { useState, useEffect } from "react";
import { Column } from "./Column";
import { FiltersHeader } from "./FiltersHeader";
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
    setOpen(!open);
  };
  return (
    <React.Fragment>
      <FiltersHeader
        open={open}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        handleClick={handleClick}
      />

      <div
        className={`lg:hidden lg:project-sidebar-expanded:block ${
          !open && sidebarExpanded ? "border-0" : "border-b border-slate-400"
        }`}
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
                      idx={idx}
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
    </React.Fragment>
  );
};
