'use client';
import React, {useCallback, useState} from 'react';
import {useRecoilState} from 'recoil';
import produce from 'immer';

import {projectAtom} from 'state';

import FilterTypeIcon from 'svg/filter-type-icon.svg';
import ShowIcon from 'svg/show-visibility.svg';
import HideIcon from 'svg/hide-visibility.svg';
import {WritableDraft} from 'immer/dist/internal';
import {webTypes} from 'types';

export const RangeFilter = ({prop}) => {
  const [project, setProject] = useRecoilState(projectAtom);
  const [visibility, setVisibility] = useState(true);
  const [min, setMin] = useState(prop.filter.min);
  const [max, setMax] = useState(prop.filter.max);

  const updateLocalRange = useCallback(
    (e, filterProp) => {
      if (filterProp === 'min') {
        setMin(e.target.value);
      } else {
        setMax(e.target.value);
      }
      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          (draft.state.properties[`${prop.axis}`].filter as unknown as WritableDraft<webTypes.INumbericFilter>)[
            filterProp
          ] = Number(e.target.value);
        })
      );
    },
    [prop.axis, setProject]
  );

  const handleRemove = useCallback(() => {
    setVisibility(false);
    setProject(
      produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
        (draft.state.properties[`${prop.axis}`].filter as unknown as WritableDraft<webTypes.INumbericFilter>).min = 0;
        (draft.state.properties[`${prop.axis}`].filter as unknown as WritableDraft<webTypes.INumbericFilter>).max = 0;
      })
    );
  }, [prop.axis, setProject]);

  const handleApply = useCallback(() => {
    setVisibility(true);
    setProject(
      produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
        (draft.state.properties[`${prop.axis}`].filter as unknown as WritableDraft<webTypes.INumbericFilter>).min =
          Number(min);
        (draft.state.properties[`${prop.axis}`].filter as unknown as WritableDraft<webTypes.INumbericFilter>).max =
          Number(max);
      })
    );
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
      className={`group flex w-full hover:bg-secondary-midnight ${visibility && 'bg-secondary-midnight'}
          } gap-x-2 my-1 items-center px-2`}
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
          value={min}
          className={`block w-16 h-4 rounded text-center font-roboto font-normal text-[10px] leading-[12px] text-white
          } border-[1px] border-gray bg-transparent hover:border-white ring-none ring-transparent focus:ring-transparent focus:outline-none hover:placeholder-white focus:border-primary-yellow`}
        />
        <p className="text-light-gray font-roboto text-[10px] font-normal leading-[12px] text-center">-</p>
        <input
          onChange={(e) => updateLocalRange(e, 'max')}
          value={max}
          type="number"
          name="max"
          id="max"
          placeholder="MAX"
          className={`block w-16 h-4 rounded font-roboto font-normal text-[10px] leading-[12px] text-white border-[1px] border-gray bg-transparent hover:border-white focus:outline-none text-center hover:placeholder-white focus:border-primary-yellow`}
        />
      </div>
      {/* SHOW/HIDE */}
      {!visibility ? (
        <div
          onClick={handleApply}
          className="rounded border border-transparent bg-secondary-space-blue hover:border-white"
        >
          <ShowIcon />
        </div>
      ) : (
        <div
          onClick={handleRemove}
          className="rounded border border-transparent bg-secondary-space-blue hover:border-white"
        >
          <HideIcon />
        </div>
      )}
    </div>
  );
};
