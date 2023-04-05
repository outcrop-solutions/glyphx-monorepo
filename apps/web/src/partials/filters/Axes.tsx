import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { useDrop } from 'react-dnd';
import { RangeFilter } from './actions/RangeFilter';
import { SearchFilter } from './actions/SearchFilter';

import { AxesIcons } from './AxesIcons';
import PlusIcon from 'public/svg/plus-icon.svg';
import GarbageIcon from 'public/svg/garbage-can-icon.svg';

import { singlePropertySelectorFamily } from 'state';
import { fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { useProject } from 'services';

export const Axes = ({ axis }) => {
  const prop = useRecoilValue(singlePropertySelectorFamily(axis));
  const [showFilter, setShowFilter] = useState(false); //shows filter property

  const { handleDrop, callETL } = useProject();

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: prop.accepts,
    drop: () => handleDrop(axis, prop),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <>
      <li
        ref={drop}
        className={`py-0 px-2 group-filters hover:bg-secondary-midnight hover:bg-opacity-70 last:mb-0 flex gap-x-2 items-center h-5`}
      >
        <AxesIcons property={axis} />
        {/* PROPERTY CHIP */}
        <div
          data-type={prop.dataType}
          className={`flex grow justify-center bg-gray h-4 truncate cursor-pointer rounded`}
        >
          <span className="inline-flex align-middle items-center text-center text-white leading-[14px] text-[12px] tracking-[.01em] font-roboto font-medium uppercase lg:opacity-100 2xl:opacity-100 transition duration-150 truncate">
            {prop?.key || ''}
          </span>
        </div>
        {/* ADD FILTER BTN */}
        <div
          onClick={() => callETL()}
          className={`flex justify-between bg-secondary-dark-blue rounded border border-transparent hover:border-white hover:cursor-pointer`}
        >
          {showFilter ? <GarbageIcon /> : <PlusIcon />}
        </div>
      </li>
      {/* filtering dropdown */}
      <>
        {prop.dataType === fileIngestionTypes.constants.FIELD_TYPE.NUMBER ? (
          <RangeFilter prop={prop} />
        ) : (
          <SearchFilter prop={prop} />
        )}
      </>
    </>
  );
};
