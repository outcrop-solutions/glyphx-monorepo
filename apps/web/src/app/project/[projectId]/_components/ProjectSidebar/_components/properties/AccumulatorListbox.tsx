'use client';
import {Fragment, useCallback, useState} from 'react';
import {Listbox, Transition} from '@headlessui/react';
import {CheckIcon} from '@heroicons/react/outline';
import {glyphEngineTypes, webTypes} from 'types';
import {useProject} from 'services';
import {WritableDraft} from 'immer/dist/internal';
import produce from 'immer';

const AccumulatorType = ({prop, project, setProject, axis}) => {
  const {handleDrop} = useProject();
  const [selected, setSelected] = useState(glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM.toUpperCase());

  const changeAccumulator = useCallback(
    (accumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE) => {
      // setProject(
      //   produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
      //     draft.state.properties[`${axis}`].accumulatorType = accumulatorType;
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
      //         accumulatorType,
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
        changeAccumulator(newValue as glyphEngineTypes.constants.ACCUMULATOR_TYPE);
      }}
    >
      <div className="relative -mt-1">
        <Listbox.Button className="relative w-full cursor-default bg-secondary-dark-blue rounded px-4 text-center shadow-md focus:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300">
          <span className="block truncate text-xs">{selected}</span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute mt-1 max-h-60 w-full rounded bg-secondary-dark-blue py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-60">
            {(
              Object.keys(
                glyphEngineTypes.constants.ACCUMULATOR_TYPE
              ) as (keyof typeof glyphEngineTypes.constants.ACCUMULATOR_TYPE)[]
            ).map((accumulator, idx) => (
              <Listbox.Option
                key={idx}
                className={({active}) =>
                  `relative cursor-default select-none py-2 text-center text-xs ${
                    active ? 'bg-secondary-midnight text-white' : 'text-white'
                  }`
                }
                value={accumulator}
              >
                {({selected}) => (
                  <>
                    <span className={`block truncate text-white text-xs ${selected ? 'font-medium' : 'font-normal'}`}>
                      {accumulator}
                    </span>
                    {/* {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-yellow-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null} */}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};

export default AccumulatorType;
