import { AxesIcons } from "./AxesIcons";
import { useState } from "react";
import { Filter } from "./Filter";
import { RangeFilter } from "./actions/RangeFilter";
import { SearchFilter } from "./actions/SearchFilter";
export const Axes = ({filtersApplied, setFiltersApplied, axis, lastDroppedItem }) => {
  const [isRange, setIsRange] = useState("none");
  return (
    <>
      <li
        className={`py-2 pl-2 last:mb-0 flex items-center ${
          isRange === "none" ? "border-b border-gray-500" : ""
        }`}
      >
        <AxesIcons property={axis} />
        <Filter isRange={isRange} setIsRange={setIsRange} />

        <div
          formatType={lastDroppedItem ? lastDroppedItem.dataType : ""}
          className={`flex justify-center h-4 ml-4 hover:text-gray-400 transition duration-150 truncate cursor-pointer rounded-2xl`}
        >
          <span className="text-xs font-medium mx-6 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
            {lastDroppedItem ? `${lastDroppedItem.key}` : `${axis}-Axis`}
          </span>
        </div>
      </li>
      {isRange !== "none" ? isRange ? <RangeFilter filtersApplied={filtersApplied} setFiltersApplied={setFiltersApplied}/> : <SearchFilter filtersApplied={filtersApplied} setFiltersApplied={setFiltersApplied}/> : null}
    </>
  );
};
