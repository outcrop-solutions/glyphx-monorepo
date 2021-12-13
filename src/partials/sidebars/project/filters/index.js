import React, { useState, useEffect } from "react";

import { Column } from "./Column";
import Filter from "./Filter";
import { Header } from "./Header";
import { Axes } from "./Axes";
import { useFilters } from "../../../../services/useFilters";
import { useColumns } from "../../../../services/useColumns";

export const Filters = ({
  filtersApplied,
  setFiltersApplied,
  sidebarExpanded,
  setSidebarExpanded,
  propertiesArr,
  handleDrop,
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);
  };
  const { filters } = useFilters();
  const [filtersState, setFiltersState] = useState([]);
  useEffect(() => {
    setFiltersState([...filters]);
  }, [filters]);
  const { columns } = useColumns();
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
          !open && sidebarExpanded
            ? "border-0 -my-2"
            : "border-b border-gray-400"
        }`}
      >
        <ul className={`overflow-auto ${!open && "hidden"}`}>
          {/* read only (no drag n drop) property filters */}
          {propertiesArr.length > 0
            ? propertiesArr.map(({ axis, lastDroppedItem }, idx) => (
                <Axes
                  axis={axis}
                  lastDroppedItem={lastDroppedItem}
                  key={idx}
                  idx={idx}
                />
              ))
            : null}
          {/* droppable column filters*/}
          {propertiesArr.length > 0
            ? propertiesArr.map(({ axis, accepts, lastDroppedItem }, idx) => (
                <Column
                  axis={axis}
                  accept={accepts}
                  lastDroppedItem={lastDroppedItem}
                  onDrop={(item) => handleDrop(idx, item)}
                  key={idx}
                  idx={idx}
                />
              ))
            : null}
        </ul>
      </div>
    </React.Fragment>
  );
};
