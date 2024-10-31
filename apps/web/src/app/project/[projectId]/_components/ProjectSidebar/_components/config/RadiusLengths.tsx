import produce from 'immer';
import React, {useTransition, useCallback, useState} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {configSelector, configsAtom, currentConfigAtom, modelRunnerAtom, radiusConfigDirtyAtom} from 'state';
import {databaseTypes} from 'types';
import {toSnakeCase} from './toSnakeCase';
import {CheckIcon} from '@heroicons/react/outline';
import {updateConfig} from 'actions';

const fields = [
  'Grid Cylinder Radius',
  'Grid Cylinder Length',
  'Grid Cone Radius',
  'Grid Cone Length',
  'Glyph Offset',
  'Z Height Ratio',
  'Z Offset',
];

export const RadiusLengths = () => {
  const config = useRecoilValue(configSelector);
  const setConfigs = useSetRecoilState(configsAtom);
  const modelRunner = useRecoilValue(modelRunnerAtom);
  const [isCollapsed, setCollapsed] = useState(true);
  const [configDirty, setConfigDirty] = useRecoilState(radiusConfigDirtyAtom);
  const currentConfig = useRecoilValue(currentConfigAtom);
  const [isPending, startTransition] = useTransition();

  const handleChange = useCallback(
    (idx: number, prop: string, value) => {
      setConfigs(
        produce((draft) => {
          draft[idx][prop] = Number(value);
        })
      );
      setConfigDirty(true);
    },
    [setConfigDirty, setConfigs]
  );

  return (
    config && (
      <div className="group flex flex-col grow">
        <summary className="flex h-8 items-center cursor-pointer justify-between w-full text-gray hover:text-white hover:border-b-white hover:bg-secondary-midnight truncate border-b border-gray z-10">
          <div
            onClick={() => {
              setCollapsed(!isCollapsed);
            }}
            className="flex ml-2 items-center"
          >
            <span className="">
              <svg
                className={`w-5 h-5 ${isCollapsed ? '-rotate-90' : 'rotate-180'}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill="#CECECE"
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <div>
              <span className="font-roboto font-medium text-[12px] leading-[14px] tracking-[.01em] ml-3 text-light-gray">
                {' '}
                Radius and Lengths{' '}
              </span>
            </div>
          </div>
          {configDirty && (
            <CheckIcon
              color="#CECECE"
              className="w-5 h-5 opacity-100 mr-2 bg-secondary-space-blue border-2 border-transparent rounded-full hover:border-white"
              onClick={async () =>
                startTransition(async () => {
                  modelRunner.update_configuration(JSON.stringify(config), true);
                  // @ts-ignore
                  await updateConfig(config?.id, config as databaseTypes.IModelConfig);
                })
              }
            />
          )}
        </summary>
        {!isCollapsed && (
          <div className="mt-2 grid grid-cols-1 gap-y-2 sm:grid-cols-6 border-b border-gray px-2 pb-4">
            {fields.map((field) => (
              <div key={field} className="sm:col-span-6">
                <label htmlFor={toSnakeCase(field)} className="block text-xs leading-6 text-white">
                  {field}
                </label>
                <div className="mt-2 w-full">
                  <input
                    id={toSnakeCase(field)}
                    name={toSnakeCase(field)}
                    placeholder={config[toSnakeCase(field)]}
                    value={config[toSnakeCase(field)]}
                    onChange={(ev) => handleChange(currentConfig, toSnakeCase(field), ev.target.value)}
                    type="number"
                    required
                    className="block w-full rounded-md pl-4 border-0 bg-white/5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  );
};
