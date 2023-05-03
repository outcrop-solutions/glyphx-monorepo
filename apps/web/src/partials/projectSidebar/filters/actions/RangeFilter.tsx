import React, { useCallback, useState } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import produce from 'immer';

import { projectAtom } from 'state';

import FilterTypeIcon from 'public/svg/filter-type-icon.svg';
import ShowIcon from 'public/svg/show-visibility.svg';
import HideIcon from 'public/svg/hide-visibility.svg';
import { useProject } from 'lib';
import { WritableDraft } from 'immer/dist/internal';
import { web as webTypes } from '@glyphx/types';

export const RangeFilter = ({ prop }) => {
  const setProject = useSetRecoilState(projectAtom);
  const [visibility, setVisibility] = useState(false);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);

  const updateLocalRange = useCallback((e, filterProp) => {
    if (filterProp === 'min') {
      setMin(e.target.value);
    } else {
      setMax(e.target.value);
    }
  }, []);

  const handleApply = useCallback(() => {
    if (!visibility) {
      // apply local min/max to project
      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          (draft.state.properties[`${prop.axis}`].filter as unknown as WritableDraft<webTypes.INumbericFilter>).min =
            min;
          (draft.state.properties[`${prop.axis}`].filter as unknown as WritableDraft<webTypes.INumbericFilter>).max =
            max;
        })
      );
    } else {
      // remove local min/max from project (reset to default)
      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          (draft.state.properties[`${prop.axis}`].filter as unknown as WritableDraft<webTypes.INumbericFilter>).min = 0;
          (draft.state.properties[`${prop.axis}`].filter as unknown as WritableDraft<webTypes.INumbericFilter>).max = 0;
        })
      );
    }
    setVisibility((prev) => !prev);
    // disable to avoid visibility re-triggering callback
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [max, min, prop.axis, setProject]);

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
          onChange={(e) => updateLocalRange(e, 'min')}
          value={prop.filter.min}
          className="block w-16 h-4 rounded text-center font-roboto font-normal text-[10px] leading-[12px] text-white border-[1px] border-gray bg-transparent hover:border-white ring-none ring-transparent focus:ring-transparent focus:outline-none hover:placeholder-white focus:border-primary-yellow"
        />
        <p className="text-light-gray font-roboto text-[10px] font-normal leading-[12px] text-center">-</p>
        <input
          onChange={(e) => updateLocalRange(e, 'max')}
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
        {!visibility ? <ShowIcon /> : <HideIcon />}
      </div>
    </div>
  );
};
