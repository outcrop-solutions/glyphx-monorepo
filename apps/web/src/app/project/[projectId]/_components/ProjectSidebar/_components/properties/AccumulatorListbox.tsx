'use client';
import {Fragment, useCallback, useState} from 'react';
import {Listbox, Transition} from '@headlessui/react';
import {glyphEngineTypes, webTypes} from 'types';
import {WritableDraft} from 'immer/dist/internal';
import produce from 'immer';
import {projectAtom} from 'state';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {fileIngestionTypes} from 'types';

const AccumulatorType = ({axis}) => {
  const [project, setProject] = useRecoilState(projectAtom);

  const changeAccumulator = useCallback(
    (accumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE) => {
      setProject(
        produce((draft: WritableDraft<webTypes.IHydratedProject>) => {
          draft.state.properties[`${axis}`].accumulatorType = accumulatorType;
        })
      );
    },
    [axis, setProject]
  );

  const accumulator =
    project?.state?.properties[`${axis}`].accumulatorType || glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM;

  return (
    <Listbox
      value={accumulator}
      onChange={(newValue) => {
        changeAccumulator(newValue as glyphEngineTypes.constants.ACCUMULATOR_TYPE);
      }}
    >
      <div className="relative mt-1 -ml-2 mr-1">
        <Listbox.Button className="relative w-full cursor-default bg-secondary-dark-blue rounded px-4 text-center shadow-md focus:outline-none focus-visible:border-blue-500 focus-visible:ring-1 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-300">
          <span className="block truncate text-xs">{accumulator}</span>
        </Listbox.Button>
        <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
          <Listbox.Options className="absolute mt-1 max-h-60 w-full rounded bg-secondary-dark-blue py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-60">
            {(
              Object.keys(
                glyphEngineTypes.constants.ACCUMULATOR_TYPE
              ) as (keyof typeof glyphEngineTypes.constants.ACCUMULATOR_TYPE)[]
            )
              .filter((key) => {
                const dataType = project?.state?.properties['Z'].dataType;
                if (
                  dataType === fileIngestionTypes.constants.FIELD_TYPE.STRING ||
                  dataType === fileIngestionTypes.constants.FIELD_TYPE.DATE
                ) {
                  if (key === glyphEngineTypes.constants.ACCUMULATOR_TYPE.COUNT) {
                    return true;
                  } else {
                    return false;
                  }
                } else {
                  return true;
                }
              })
              .map((accumulator, idx) => (
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
