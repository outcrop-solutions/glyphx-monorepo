import React, { useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';
import produce from 'immer';

import { projectAtom } from 'state';

import FilterTypeIcon from 'public/svg/filter-type-icon.svg';
import ShowIcon from 'public/svg/show-visibility.svg';
import HideIcon from 'public/svg/hide-visibility.svg';
import { useProject } from 'lib';

export const RangeFilter = ({ prop }) => {
  const [project, setProject] = useRecoilState(projectAtom);
  const { handleDrop } = useProject();
  const [showVisibility, setVisibility] = useState(false); //

  const updateRange = useCallback(
    (e, filterProp) => {
      setProject(
        produce((draft) => {
          draft.state.properties[`${prop.axis}`].filter[`${filterProp}`] = e.target.value;
        })
      );
    },
    [prop.axis, setProject]
  );

  // TODO: verify update works, add validation/disabled
  const handleApply = useCallback(() => {
    handleDrop(prop.axis, { key: prop.key, dataType: prop.dataType }, project, true);
    setVisibility(!showVisibility);
  }, [handleDrop, project, prop.axis, prop.dataType, prop.key, showVisibility]);

  return (
    <div
      onKeyPress={(ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
        }
      }}
      className="group flex w-full hover:bg-secondary-midnight gap-x-2 my-1 items-center px-2"
    >
      {/* FILTER TYPE BTN */}
      <FilterTypeIcon />
      {/* INPUTS */}
      <div className="flex grow items-center justify-between">
        <input
          type="number"
          name="min"
          placeholder="MIN"
          id="min"
          onChange={(e) => updateRange(e, 'min')}
          value={prop.filter.min}
          className="block w-16 h-4 rounded text-center font-roboto font-normal text-[10px] leading-[12px] text-white border-[1px] border-gray bg-transparent hover:border-white ring-none ring-transparent focus:ring-transparent focus:outline-none hover:placeholder-white focus:border-primary-yellow"
        />
        <p className="text-light-gray font-roboto text-[10px] font-normal leading-[12px] text-center">-</p>
        <input
          onChange={(e) => updateRange(e, 'max')}
          value={prop.filter.max}
          type="number"
          name="max"
          id="max"
          placeholder="MAX"
          className="block w-16 h-4 rounded font-roboto font-normal text-[10px] leading-[12px] text-white border-[1px] border-gray bg-transparent hover:border-white focus:outline-none text-center hover:placeholder-white focus:border-primary-yellow"
        />
      </div>
      {/* SHOW/HIDE */}
      <div
        onClick={handleApply}
        className="rounded border border-transparent bg-secondary-space-blue hover:border-white"
      >
        {!showVisibility ? <ShowIcon /> : <HideIcon />}
      </div>
    </div>
  );
};
