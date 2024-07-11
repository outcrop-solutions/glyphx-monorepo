import produce from 'immer';
import React, {startTransition, useCallback, useState} from 'react';
import {SketchPicker} from 'react-color';

import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {configSelector, configsAtom, currentConfigAtom, colorsConfigDirtyAtom} from 'state';
import {databaseTypes} from 'types';
import {CheckIcon} from '@heroicons/react/outline';
import {Color} from './Color';
const fields = ['Max Color', 'Min Color', 'Background Color', 'X Axis Color', 'Y Axis Color', 'Z Axis Color'];

export const Colors = () => {
  const config = useRecoilValue(configSelector);
  const setConfigs = useSetRecoilState(configsAtom);
  const currentConfig = useRecoilValue(currentConfigAtom);
  const [isCollapsed, setCollapsed] = useState(true);
  const [configDirty, setConfigDirty] = useRecoilState(colorsConfigDirtyAtom);

  const handleChange = useCallback(
    (idx: number, prop: string, value) => {
      setConfigs(
        produce((draft) => {
          draft[idx][prop] = value;
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
                Colors{' '}
              </span>
            </div>
          </div>
          {configDirty && (
            <CheckIcon
              color="#CECECE"
              className="w-5 h-5 opacity-100 mr-2 bg-secondary-space-blue border-2 border-transparent rounded-full hover:border-white"
              onClick={() =>
                startTransition(() =>
                  // @ts-ignore
                  updateConfig(config?.id, config as databaseTypes.IModelConfig)
                )
              }
            />
          )}
        </summary>
        {!isCollapsed && (
          <div className="space-y-5">
            {fields.map((field) => (
              <Color config={config} currentConfig={currentConfig} handleChange={handleChange} field={field} />
            ))}
          </div>
        )}
      </div>
    )
  );
};
