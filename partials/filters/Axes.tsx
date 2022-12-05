import { AxesIcons } from "./AxesIcons";
import { useState } from "react";
import { Filter } from "./Filter";
import { RangeFilter } from "./actions/RangeFilter";
import { SearchFilter } from "./actions/SearchFilter";
import { API, graphqlOperation } from "aws-amplify";
import { deleteFilter } from "graphql/mutations";
import { ShowHide } from "./actions/ShowHide";
import { DeleteFilter } from "./actions/DeleteFilter";
import { useRecoilState, useSetRecoilState } from "recoil";
import { propertiesAtom } from "@/state/properties";
import { filtersAppliedAtom } from "@/state/filters";

export const Axes = ({ axis, lastDroppedItem }) => {
  const setProperties = useSetRecoilState(propertiesAtom);
  const [filtersApplied, setFiltersApplied] =
    useRecoilState(filtersAppliedAtom);

  const [isFilter, setIsFilter] = useState(false); //shows filter property
  const [applied, setApplied] = useState(
    filtersApplied.includes(lastDroppedItem) ? true : false
  );

  // For number datatype
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  const [hide, setHide] = useState(false);
  const [showVisibility, setVisibility] = useState(false); //true means eye with no dash, false means eye with dash

  // const handleApply = () => {
  //   setFiltersApplied((prev) => {
  //     if (applied) {
  //       let newArr = prev.filter((el) => el.name !== lastDroppedItem.key);

  //       return [...newArr];
  //     } else {
  //       let newArr = [...prev, { name: lastDroppedItem.key, min, max }];

  //       return [...newArr];
  //     }
  //   });
  //   setApplied((prev) => !prev);
  // };
  // const handleDeleteFilter = async () => {
  //   let deleteFilterInput = { id: lastDroppedItem.id };
  //   setProperties((prev) => {
  //     let newProps = prev;
  //     if (prev.length > 0) {
  //       newProps = prev.map((el) => {
  //         let newEl = el;
  //         if (el.axis === axis) {
  //           newEl = { ...el, lastDroppedItem: null };
  //         }
  //         return newEl;
  //       });
  //     }
  //     return newProps;
  //   });

  //   const result = await API.graphql(
  //     graphqlOperation(deleteFilter, { input: deleteFilterInput })
  //   );
  //   console.log({ result });
  // };

  function deleteFilter() {
    setFiltersApplied((prev) => {
      return prev.filter((internalFilter) => {
        // remove this axis filter
        return internalFilter.name !== lastDroppedItem.key;
      });
    });
  }

  function showHide() {
    setHide(true);
  }

  function hideHide() {
    setHide(false);
  }

  function setFilter() {
    setIsFilter(!isFilter);
  }

  return (
    <>
      <li
        className={`py-0 px-2 group-filters hover:bg-secondary-midnight hover:bg-opacity-70 last:mb-0 flex gap-x-2 items-center h-5`}
        onMouseOver={showHide}
        onMouseOut={hideHide}
      >
        <AxesIcons property={axis} />
        {/* PROPERTY CHIP */}
        <div
          // @ts-ignore
          formattype={lastDroppedItem ? lastDroppedItem.dataType : ""}
          className={`flex grow justify-center bg-gray h-4 truncate cursor-pointer rounded`}
        >
          <span className="inline-flex align-middle items-center text-center text-white leading-[14px] text-[12px] tracking-[.01em] font-roboto font-medium uppercase lg:opacity-100 2xl:opacity-100 transition duration-150 truncate">
            {lastDroppedItem ? `${lastDroppedItem.key}` : `${axis}-Axis`}
          </span>
        </div>
        <div
          className="border border-transparent hover:border-white rounded"
          onClick={() => {
            setVisibility(!showVisibility);
          }}
        >
          {!showVisibility ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 4.98136C9.50545 4.98136 10.7273 6.20318 10.7273 7.70864C10.7273 7.98682 10.6727 8.25409 10.5964 8.505L12.2655 10.1741C13.0236 9.50318 13.6236 8.66318 14 7.70318C13.0564 5.31409 10.7273 3.61773 8 3.61773C7.30727 3.61773 6.64182 3.72682 6.01455 3.92864L7.19818 5.11227C7.45455 5.03591 7.72182 4.98136 8 4.98136ZM2.93273 3.15955C2.72 3.37227 2.72 3.71591 2.93273 3.92864L4.00727 5.00318C3.12364 5.70682 2.42 6.63409 2 7.70864C2.94364 10.1032 5.27273 11.7995 8 11.7995C8.82909 11.7995 9.62 11.6359 10.3509 11.3523L11.8345 12.8359C12.0473 13.0486 12.3909 13.0486 12.6036 12.8359C12.8164 12.6232 12.8164 12.2795 12.6036 12.0668L3.70727 3.15955C3.49455 2.94682 3.14545 2.94682 2.93273 3.15955ZM8 10.4359C6.49455 10.4359 5.27273 9.21409 5.27273 7.70864C5.27273 7.28864 5.37091 6.89045 5.54 6.54136L6.39636 7.39773C6.38 7.49591 6.36364 7.59955 6.36364 7.70864C6.36364 8.61409 7.09455 9.345 8 9.345C8.10909 9.345 8.20727 9.32864 8.31091 9.30682L9.16727 10.1632C8.81273 10.3377 8.42 10.4359 8 10.4359ZM9.62 7.52864C9.53818 6.765 8.93818 6.17045 8.18 6.08864L9.62 7.52864Z"
                fill="white"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 3.41333C5.27273 3.41333 2.94364 5.22278 2 7.77697C2.94364 10.3311 5.27273 12.1406 8 12.1406C10.7273 12.1406 13.0564 10.3311 14 7.77697C13.0564 5.22278 10.7273 3.41333 8 3.41333ZM8 10.6861C6.49455 10.6861 5.27273 9.38278 5.27273 7.77697C5.27273 6.17115 6.49455 4.86788 8 4.86788C9.50545 4.86788 10.7273 6.17115 10.7273 7.77697C10.7273 9.38278 9.50545 10.6861 8 10.6861ZM8 6.03151C7.09455 6.03151 6.36364 6.81115 6.36364 7.77697C6.36364 8.74278 7.09455 9.52242 8 9.52242C8.90545 9.52242 9.63636 8.74278 9.63636 7.77697C9.63636 6.81115 8.90545 6.03151 8 6.03151Z"
                fill="white"
              />
            </svg>
          )}
        </div>
        {/* ADD FILTER BTN */}
        <div
          onClick={setFilter}
          className="flex justify-between bg-secondary-dark-blue rounded border border-transparent hover:border-white hover:cursor-pointer"
        >
          {isFilter ? (
            <svg
              onClick={deleteFilter}
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.7782 3.22943C12.4824 2.93364 12.0045 2.93364 11.7088 3.22943L8 6.9306L4.29124 3.22184C3.99545 2.92605 3.51763 2.92605 3.22184 3.22184C2.92605 3.51763 2.92605 3.99545 3.22184 4.29124L6.9306 8L3.22184 11.7088C2.92605 12.0045 2.92605 12.4824 3.22184 12.7782C3.51763 13.0739 3.99545 13.0739 4.29124 12.7782L8 9.0694L11.7088 12.7782C12.0045 13.0739 12.4824 13.0739 12.7782 12.7782C13.0739 12.4824 13.0739 12.0045 12.7782 11.7088L9.0694 8L12.7782 4.29124C13.0664 4.00303 13.0664 3.51763 12.7782 3.22943Z"
                fill="white"
              />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.1429 8.85714H8.85714V13.1429C8.85714 13.6143 8.47143 14 8 14C7.52857 14 7.14286 13.6143 7.14286 13.1429V8.85714H2.85714C2.38571 8.85714 2 8.47143 2 8C2 7.52857 2.38571 7.14286 2.85714 7.14286H7.14286V2.85714C7.14286 2.38571 7.52857 2 8 2C8.47143 2 8.85714 2.38571 8.85714 2.85714V7.14286H13.1429C13.6143 7.14286 14 7.52857 14 8C14 8.47143 13.6143 8.85714 13.1429 8.85714Z"
                fill="#CECECE"
              />
            </svg>
          )}
        </div>
      </li>
      {/* filtering dropdown */}
      {isFilter && lastDroppedItem ? (
        lastDroppedItem.dataType === "number" ? (
          <RangeFilter
            setVisible={setIsFilter}
            lastDroppedItem={lastDroppedItem}
          />
        ) : (
          <SearchFilter lastDroppedItem={lastDroppedItem} />
        )
      ) : null}
    </>
  );
};
