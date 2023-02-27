import { useState } from 'react';
import { useDrop } from 'react-dnd';
import { RangeFilter } from './actions/RangeFilter';
import { SearchFilter } from './actions/SearchFilter';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { filtersAppliedAtom } from 'state/filters';
import { propertiesAtom } from 'state/properties';

export const Column = ({ axis, accept, lastDroppedItem, onDrop, idx }) => {
  const [filtersApplied, setFiltersApplied] = useRecoilState(filtersAppliedAtom);
  const setProperties = useSetRecoilState(propertiesAtom);
  const [applied, setApplied] = useState(filtersApplied.includes(lastDroppedItem) ? true : false);
  const [isFilter, setIsFilter] = useState(false);

  const [hide, setHide] = useState(false);
  const [showVisibility, setVisibility] = useState(false); //true means eye with no dash, false means eye with dash
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
            data-type={lastDroppedItem ? lastDroppedItem.dataType : ''}
            className="inline-flex grow align-middle items-center text-center justify-center h-4 text-white leading-[14px] text-[12px] tracking-[.01em] font-roboto font-medium  uppercase bg-gray transition duration-150 truncate cursor-pointer rounded lg:opacity-100 2xl:opacity-100"
          >
            {lastDroppedItem ? `${lastDroppedItem.key}` : `Column ${idx + 1}`}
          </div>
        )}
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
