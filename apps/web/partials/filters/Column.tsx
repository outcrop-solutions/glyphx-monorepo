import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { Filter } from './Filter';
import { RangeFilter } from './actions/RangeFilter';
import { SearchFilter } from './actions/SearchFilter';
// import { API, graphqlOperation } from "aws-amplify";
// import { deleteFilter } from "graphql/mutations";

import { ShowHide } from './actions/ShowHide';
import { DeleteFilter } from './actions/DeleteFilter';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { filtersAppliedAtom } from '@/state/filters';
import { propertiesAtom } from '@/state/properties';

export const Column = ({ axis, accept, lastDroppedItem, onDrop, idx }) => {
  const [filtersApplied, setFiltersApplied] = useRecoilState(filtersAppliedAtom);
  const setProperties = useSetRecoilState(propertiesAtom);
  const [applied, setApplied] = useState(filtersApplied.includes(lastDroppedItem) ? true : false);
  const [isFilter, setIsFilter] = useState(false);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  const [hide, setHide] = useState(false);
  const [showVisibility, setVisibility] = useState(false); //true means eye with no dash, false means eye with dash

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
    // const result = await API.graphql(
    //   graphqlOperation(deleteFilter, { input: deleteFilterInput })
    // );
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
        className={`py-0 px-2 group-filters hover:bg-secondary-midnight hover:bg-opacity-70 last:mb-0 flex gap-x-2 items-center h-5 ${
          isFilter ? 'border-b border-gray' : ''
        }`}
        onMouseOver={showHide}
        onMouseOut={hideHide}
      >
        <div className="bg-secondary-space-blue p-0 rounded">
          <div
            className={`flex justify-center items-center w-4 h-4 font-roboto font-medium text-[12px] leading-[14px] tracking-[0.01em] text-center rounded-full text-light-gray group-filters-hover:text-white `}
          >
            <p>{`${axis}`}</p>
          </div>
        </div>
        {isActive ? (
          <div className="block text-gray hover:text-gray transition duration-150 truncate">
            <span className="text-sm font-medium ml-3 lg:opacity-100 2xl:opacity-100 duration-200">
              release to drop
            </span>
          </div>
        ) : (
          <div
            // @ts-ignore
            data-type={lastDroppedItem ? lastDroppedItem.dataType : ''}
            className="inline-flex grow align-middle items-center text-center justify-center h-4 text-white leading-[14px] text-[12px] tracking-[.01em] font-roboto font-medium  uppercase bg-gray transition duration-150 truncate cursor-pointer rounded lg:opacity-100 2xl:opacity-100"
          >
            {/* <span className="text-xs font-medium lg:opacity-100 2xl:opacity-100 duration-200"> */}
            {lastDroppedItem ? `${lastDroppedItem.key}` : `Column ${idx + 1}`}
            {/* </span> */}
          </div>
        )}
        {/* <div
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
        </div> */}
        <div className="flex justify-between bg-secondary-dark-blue rounded border border-transparent hover:border-white hover:cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13.1429 8.85714H8.85714V13.1429C8.85714 13.6143 8.47143 14 8 14C7.52857 14 7.14286 13.6143 7.14286 13.1429V8.85714H2.85714C2.38571 8.85714 2 8.47143 2 8C2 7.52857 2.38571 7.14286 2.85714 7.14286H7.14286V2.85714C7.14286 2.38571 7.52857 2 8 2C8.47143 2 8.85714 2.38571 8.85714 2.85714V7.14286H13.1429C13.6143 7.14286 14 7.52857 14 8C14 8.47143 13.6143 8.85714 13.1429 8.85714Z"
              fill="#CECECE"
            />
          </svg>
        </div>
      </li>
      {isFilter && lastDroppedItem ? (
        lastDroppedItem.dataType === 'number' ? (
          <RangeFilter setVisible={setIsFilter} lastDroppedItem={lastDroppedItem} />
        ) : (
          <SearchFilter lastDroppedItem={lastDroppedItem} />
        )
      ) : null}
    </>
  );
};
