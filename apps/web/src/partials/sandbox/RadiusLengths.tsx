import produce from 'immer';
import React, { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { configSelector, configsAtom, currentConfigAtom } from 'state';
import { toSnakeCase } from './toSnakeCase';

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
  const currentConfig = useRecoilValue(currentConfigAtom);

  const handleChange = useCallback(
    (idx: number, prop: string, value) => {
      setConfigs(
        produce((draft) => {
          draft[idx][prop] = value;
        })
      );
    },
    [setConfigs]
  );

  return (
    <details className="py-2">
      <summary className="text-base font-semibold leading-7 text-white cursor-pointer">Radius and Lengths</summary>
      <div className="mt-2 grid grid-cols-1 gap-y-2 sm:grid-cols-6">
        {fields.map((field) => (
          <div className="sm:col-span-6">
            <label htmlFor={toSnakeCase(field)} className="block text-sm font-medium leading-6 text-white">
              {field}
            </label>
            <div className="mt-2 w-full">
              <input
                id={toSnakeCase(field)}
                name={toSnakeCase(field)}
                value={config}
                onChange={(ev) => handleChange(currentConfig, toSnakeCase(field), ev.target.value)}
                type="number"
                className="block w-full rounded-md pl-4 border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        ))}
      </div>
    </details>
  );
};
