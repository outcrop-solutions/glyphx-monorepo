import { useState } from "react";
import { useDrop } from "react-dnd";
import { Filter } from "./Filter";
import { RangeFilter } from "./actions/RangeFilter";
import { SearchFilter } from "./actions/SearchFilter";
export const Column = ({
  filtersApplied,
  setFiltersApplied,
  axis,
  accept,
  lastDroppedItem,
  onDrop,
  idx,
}) => {
  const [isRange, setIsRange] = useState("none");
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const isActive = isOver && canDrop;

  return (
    <>
      <li
        ref={drop}
        className="py-2 pl-2 last:mb-0 flex items-center border-b border-gray-500"
      >
        <div className="pl-2 mr-2">{`${axis}`}</div>
        <Filter isRange={isRange} setIsRange={setIsRange} />
        {isActive ? (
          <div className="block text-gray-400 hover:text-gray-200 transition duration-150 truncate">
            <span className="text-sm font-medium ml-3 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
              release to drop
            </span>
          </div>
        ) : (
          <div
            formatType={lastDroppedItem ? lastDroppedItem.dataType : ""}
            className={`flex justify-center h-4 ml-4 hover:text-gray-400 transition duration-150 truncate cursor-pointer rounded-2xl`}
          >
            <span className="text-xs font-medium mx-6 lg:opacity-0 lg:project-sidebar-expanded:opacity-100 2xl:opacity-100 duration-200">
              {lastDroppedItem ? `${lastDroppedItem.key}` : `Column ${idx + 1}`}
            </span>
          </div>
        )}
        {/* 
      {lastDroppedItem && (
        <p>Last dropped: {JSON.stringify(lastDroppedItem)}</p>
      )} */}
      </li>
      {isRange !== "none" ? (
        isRange ? (
          <RangeFilter
            filtersApplied={filtersApplied}
            setFiltersApplied={setFiltersApplied}
          />
        ) : (
          <SearchFilter
            filtersApplied={filtersApplied}
            setFiltersApplied={setFiltersApplied}
          />
        )
      ) : null}
    </>
  );
};
