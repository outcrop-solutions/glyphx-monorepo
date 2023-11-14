'use client';
import {Fragment, useCallback, useState} from 'react';
import {Listbox, Transition} from '@headlessui/react';
import {CheckIcon} from '@heroicons/react/outline';
import {glyphEngineTypes, webTypes} from 'types';
import {WritableDraft} from 'immer/dist/internal';
import produce from 'immer';
import {useProject} from 'services';
import {DateGroupOptions} from './DateGroupOptions';

const DateGroupingListbox = ({prop, project, setProject, axis, setDirty}) => {
  const [selected, setSelected] = useState(glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR.toUpperCase());
  const {handleDrop} = useProject();

  const changeDateGrouping = useCallback(
    (dateGrouping: glyphEngineTypes.constants.DATE_GROUPING) => {
      // setProject(
      //   produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
      //     draft.state.properties[`${axis}`].dateGrouping = dateGrouping;
      //   })
      // );
      // const newProject = {
      //   ...project,
      //   state: {
      //     ...project.state,
      //     properties: {
      //       ...project.state.properties,
      //       [`${axis}`]: {
      //         ...project.state.properties[axis],
      //         dateGrouping,
      //       },
      //     },
      //   },
      // };
      // handleDrop(
      //   axis,
      //   {
      //     type: 'COLUMN_DRAG',
      //     key: prop.key,
      //     dataType: prop.dataType,
      //   },
      //   newProject,
      //   false
      // );
    },
    [axis, handleDrop, prop, project, setProject]
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
                  {({selected}) => <DateGroupOptions setDirty={setDirty} grouping={accumulator} selected={selected} />}
                </Listbox.Option>
              ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default DateGroupingListbox;
