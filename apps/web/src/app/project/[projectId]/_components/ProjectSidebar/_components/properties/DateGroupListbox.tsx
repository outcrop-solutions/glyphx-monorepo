'use client';
import {Fragment, useCallback, useState} from 'react';
import {Listbox, Transition} from '@headlessui/react';
import {glyphEngineTypes, webTypes} from 'types';
import {WritableDraft} from 'immer/dist/internal';
import produce from 'immer';
import {DateGroupOptions} from './DateGroupOptions';
import {projectAtom} from 'state';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {dayAtom, domAtom, dowAtom, monthAtom, quarterAtom, woyAtom} from 'state';

const DateGroupingListbox = ({axis}) => {
  const [selected, setSelected] = useState(glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR.toUpperCase());
  const setProject = useSetRecoilState(projectAtom);
  const doy = useRecoilValue(dayAtom);
  const month = useRecoilValue(monthAtom);
  const dom = useRecoilValue(domAtom);
  const dow = useRecoilValue(dowAtom);
  const woy = useRecoilValue(woyAtom);
  const quarter = useRecoilValue(quarterAtom);

  const changeDateGrouping = useCallback(
    (dateGrouping: glyphEngineTypes.constants.DATE_GROUPING) => {
      let retval: glyphEngineTypes.constants.DATE_GROUPING;

      if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR && doy) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR;
      } else if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR && !doy) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR;
      }

      if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.MONTH && month) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_MONTH;
      } else if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.MONTH && !month) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.MONTH;
      }

      if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_MONTH && dom.year && dom.month) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_MONTH;
      } else if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_MONTH && dom.year && !dom.month) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.YEAR_DAY_OF_MONTH;
      } else if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_MONTH && !dom.year && dom.month) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.MONTH_DAY_OF_MONTH;
      } else if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_MONTH && !dom.year && !dom.month) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.MONTH;
      }

      if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_WEEK && dow) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_WEEK;
      } else if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_WEEK && !dow) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_WEEK;
      }

      if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.WEEK_OF_YEAR && woy) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_WEEK_OF_YEAR;
      } else if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.WEEK_OF_YEAR && !woy) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.WEEK_OF_YEAR;
      }

      if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.QUARTER && quarter) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_QUARTER;
      } else if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.QUARTER && !quarter) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.QUARTER;
      }

      if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.YEAR_OF_WEEK) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.YEAR_OF_WEEK;
      } else if (dateGrouping === glyphEngineTypes.constants.DATE_GROUPING.YEAR) {
        retval = glyphEngineTypes.constants.DATE_GROUPING.YEAR;
      }

      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          draft.state.properties[`${axis}`].dateGrouping = retval;
        })
      );
    },
    [axis, dom, dow, doy, month, quarter, setProject, woy]
  );

  return (
    <Listbox
      value={selected}
      onChange={(newValue) => {
        setSelected(newValue);
        changeDateGrouping(newValue as glyphEngineTypes.constants.DATE_GROUPING);
      }}
    >
      <div className="relative -mt-1">
        <Listbox.Button className="relative w-full cursor-default bg-secondary-dark-blue rounded px-4 text-center shadow-md focus:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300">
          <span className="block truncate text-xs">{selected.replaceAll('_', ' ')}</span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute mt-1 max-h-60 overflow-y-auto w-full rounded bg-secondary-dark-blue py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-60">
            {(
              Object.keys(
                glyphEngineTypes.constants.DATE_GROUPING
              ) as (keyof typeof glyphEngineTypes.constants.DATE_GROUPING)[]
            )
              .filter(
                (key) => !key.includes('QUALIFIED') && key !== 'MONTH_DAY_OF_MONTH' && key !== 'YEAR_DAY_OF_MONTH'
              )
              .map((key) => key.replaceAll('_', ' '))
              .map((accumulator, idx) => (
                <Listbox.Option
                  key={idx}
                  className={({active}) =>
                    `relative group/option cursor-default select-none py-2 text-center text-xs ${
                      active ? 'bg-secondary-midnight text-white' : 'text-white'
                    }`
                  }
                  value={accumulator}
                >
                  {({selected}) => <DateGroupOptions grouping={accumulator} selected={selected} />}
                </Listbox.Option>
              ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default DateGroupingListbox;
