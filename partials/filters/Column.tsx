import { useState } from "react";
import { useDrop } from "react-dnd";
import { Filter } from "./Filter";
import { RangeFilter } from "./actions/RangeFilter";
import { SearchFilter } from "./actions/SearchFilter";
import { API, graphqlOperation } from "aws-amplify";
import { deleteFilter } from "graphql/mutations";

import { ShowHide } from "./actions/ShowHide";
import { DeleteFilter } from "./actions/DeleteFilter";
import { useRecoilState, useSetRecoilState } from "recoil";
import { filtersAppliedAtom } from "@/state/filters";
import { propertiesSelector } from "@/state/properties";

export const Column = ({ axis, accept, lastDroppedItem, onDrop, idx }) => {
  const [filtersApplied, setFiltersApplied] = useRecoilState(
    filtersAppliedAtom
  );
  const setProperties = useSetRecoilState(propertiesSelector);
  const [applied, setApplied] = useState(
    filtersApplied.includes(lastDroppedItem) ? true : false
  );
  const [isFilter, setIsFilter] = useState(false);
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const [hide, setHide] = useState(false);

  const handleApply = () => {
    setFiltersApplied((prev) => {
      if (applied) {
        let newArr = prev.filter((el) => el.name !== lastDroppedItem.key);
        return [...newArr];
      } else {
        let newArr = [...prev, { name: lastDroppedItem.key, min, max }];
        return [...newArr];
      }
    });
    setApplied((prev) => !prev);
  };
  const handleDeleteFilter = async () => {
    let deleteFilterInput = { id: lastDroppedItem.id };

    setProperties((prev) => {
      let newProps = prev;
      if (prev.length > 0) {
        newProps = prev.map((el) => {
          let newEl = el;
          if (el.axis === axis) {
            newEl = { ...el, lastDroppedItem: null };
          }
          return newEl;
        });
      }
      return newProps;
    });
    const result = await API.graphql(
      graphqlOperation(deleteFilter, { input: deleteFilterInput })
    );
  };
  const [{ isOver, canDrop }, drop] = useDrop({
    accept,
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  const isActive = isOver && canDrop;

  function showHide() {
    setHide(true);
  }

  function hideHide() {
    setHide(false);
  }

  return (
    <>
      <li
        ref={drop}
        className={`py-2 group-filters hover:bg-gray hover:bg-opacity-70 pl-2 last:mb-0 flex items-center ${isFilter ? "border-b border-gray" : ""
          }`}
        onMouseOver={showHide}
        onMouseOut={hideHide}
      >
        <div className="bg-secondary-space-blue border-2 border-transparent hover:border-white p-0 rounded-full">
          {
            !hide ?
              <div
                className={`${axis === "1" ? "mr-2" : "mr-1"
                  } text-gray group-filters-hover:text-white pl-2`}
              >{`${axis}`}</div>
              :
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 4.98136C9.50545 4.98136 10.7273 6.20318 10.7273 7.70864C10.7273 7.98682 10.6727 8.25409 10.5964 8.505L12.2655 10.1741C13.0236 9.50318 13.6236 8.66318 14 7.70318C13.0564 5.31409 10.7273 3.61773 8 3.61773C7.30727 3.61773 6.64182 3.72682 6.01455 3.92864L7.19818 5.11227C7.45455 5.03591 7.72182 4.98136 8 4.98136ZM2.93273 3.15955C2.72 3.37227 2.72 3.71591 2.93273 3.92864L4.00727 5.00318C3.12364 5.70682 2.42 6.63409 2 7.70864C2.94364 10.1032 5.27273 11.7995 8 11.7995C8.82909 11.7995 9.62 11.6359 10.3509 11.3523L11.8345 12.8359C12.0473 13.0486 12.3909 13.0486 12.6036 12.8359C12.8164 12.6232 12.8164 12.2795 12.6036 12.0668L3.70727 3.15955C3.49455 2.94682 3.14545 2.94682 2.93273 3.15955ZM8 10.4359C6.49455 10.4359 5.27273 9.21409 5.27273 7.70864C5.27273 7.28864 5.37091 6.89045 5.54 6.54136L6.39636 7.39773C6.38 7.49591 6.36364 7.59955 6.36364 7.70864C6.36364 8.61409 7.09455 9.345 8 9.345C8.10909 9.345 8.20727 9.32864 8.31091 9.30682L9.16727 10.1632C8.81273 10.3377 8.42 10.4359 8 10.4359ZM9.62 7.52864C9.53818 6.765 8.93818 6.17045 8.18 6.08864L9.62 7.52864Z" fill="white" />
              </svg>
          }


        </div>


        {lastDroppedItem ? (
          // <Filter
          //   isFilter={isFilter}
          //   setIsFilter={setIsFilter}
          //   type={lastDroppedItem.dataType}
          // />
          <div></div>
        ) : (
          <div>
          </div>
        )}
        {isActive ? (
          <div className="block text-gray hover:text-gray transition duration-150 truncate">
            <span className="text-sm font-medium ml-3 lg:opacity-100 2xl:opacity-100 duration-200">
              release to drop
            </span>
          </div>
        ) : (
          <div
            // @ts-ignore
            formattype={lastDroppedItem ? lastDroppedItem.dataType : ""}
            className="h-4 min-w-[10rem] text-center text-black uppercase px-4 my-auto ml-4 bg-gray hover:text-black transition duration-150 truncate cursor-pointer rounded-2xl text-xs font-medium lg:opacity-100 2xl:opacity-100"
          >
            {/* <span className="text-xs font-medium lg:opacity-100 2xl:opacity-100 duration-200"> */}
            {lastDroppedItem ? `${lastDroppedItem.key}` : `Column ${idx + 1}`}
            {/* </span> */}
          </div>
        )}
        <div className="flex justify-between ml-2 bg-secondary-dark-blue rounded-full border-2 border-transparent hover:border-white hover:cursor-pointer">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.8571 13.1429H13.1429V18.8571C13.1429 19.4857 12.6286 20 12 20C11.3714 20 10.8571 19.4857 10.8571 18.8571V13.1429H5.14286C4.51429 13.1429 4 12.6286 4 12C4 11.3714 4.51429 10.8571 5.14286 10.8571H10.8571V5.14286C10.8571 4.51429 11.3714 4 12 4C12.6286 4 13.1429 4.51429 13.1429 5.14286V10.8571H18.8571C19.4857 10.8571 20 11.3714 20 12C20 12.6286 19.4857 13.1429 18.8571 13.1429Z" fill="white" />
          </svg>
        </div>
      </li>
      {isFilter && lastDroppedItem ? (
        lastDroppedItem.dataType === "number" ? (
          <RangeFilter min={min} setMin={setMin} max={max} setMax={setMax} />
        ) : (
          <SearchFilter lastDroppedItem={lastDroppedItem} />
        )
      ) : null}
    </>
  );
};
