import React, { useState, useEffect } from "react";
import { Column } from "./Column";
import { Header } from "./Header";
import { Axes } from "./Axes";
import { useFilterChange } from "../../../../services/useFilterChange";

export const Filters = ({
  sidebarExpanded,
  setSidebarExpanded,
  propertiesArr,
  setPropertiesArr,
  handleDrop,
}) => {
  const [open, setOpen] = useState(true);
  const [filtersApplied, setFiltersApplied] = useState([]);
  const { isFilterChanged } = useFilterChange(filtersApplied);

  const handleClick = () => {
    setOpen(!open);
  };
  return (
    <React.Fragment>
      <Header
        open={open}
        sidebarExpanded={sidebarExpanded}
        setSidebarExpanded={setSidebarExpanded}
        handleClick={handleClick}
      />

      <div
        className={`lg:hidden lg:project-sidebar-expanded:block ${
          !open && sidebarExpanded ? "border-0" : "border-b border-gray-400"
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
