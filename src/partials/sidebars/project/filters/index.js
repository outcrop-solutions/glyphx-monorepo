import React, { useState, useEffect } from "react";

import Column from "./Column";
import Filter from "./Filter";
import { Header } from "./Header";
import { useFilters } from "../../../../services/useFilters";
import { useColumns } from "../../../../services/useColumns";

export const Filters = ({
  filtersApplied,
  setFiltersApplied,
  sidebarExpanded,
  setSidebarExpanded,
  showCols,
  setShowCols,
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
      {filtersState.length > 0 && (
        <div
          className={`lg:hidden lg:project-sidebar-expanded:block 2xl:block py-2  ${
            !open && sidebarExpanded
              ? "border-0 -my-2"
              : "border-b border-gray-400"
          }`}
        >
          <ul
            style={{ height: "200px" }}
            className={`pl-2 mt-1 overflow-auto ${!open && "hidden"}`}
          >
            {filtersState.map((item, idx) => (
              <Filter
                key={item.id}
                filtersState={filtersState}
                setFiltersState={setFiltersState}
                filtersApplied={filtersApplied}
                setFiltersApplied={setFiltersApplied}
                setShowCols={setShowCols}
                columns={columns}
                item={item}
              />
            ))}
            {showCols ? (
              <>
                {columns.length > 0 && (
                  <>
                    {columns.map((item, idx) => (
                      <Column key={idx} item={item} />
                    ))}
                  </>
                )}
              </>
            ) : null}
          </ul>
        </div>
      )}
    </React.Fragment>
  );
};
