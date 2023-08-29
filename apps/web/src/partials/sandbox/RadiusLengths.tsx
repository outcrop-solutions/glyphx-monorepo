import produce from 'immer';
import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { togglesConfigDirtyAtom, configSelector, configsAtom, currentConfigAtom, radiusConfigDirtyAtom } from 'state';
import { database as databaseTypes } from '@glyphx/types';
import { toSnakeCase } from './toSnakeCase';
import { _updateConfig, api } from 'lib';

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
  const [configDirty, setConfigDirty] = useRecoilState(radiusConfigDirtyAtom);
  const currentConfig = useRecoilValue(currentConfigAtom);

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

  const saveChanges = useCallback(async () => {
    await api({
      ..._updateConfig(config?._id.toString(), config as databaseTypes.IModelConfig),
      setLoading: (loading) => setConfigDirty(loading),
    });
  }, [config, setConfigDirty]);

  return (
    config && (
      <details className="py-2">
        <summary className="flex items-center justify-between text-base font-semibold leading-7 text-white cursor-pointer">
          Radius and Lengths
          {configDirty && (
            <div
              onClick={saveChanges}
              className="bg-yellow hover:bg-primary-yellow rounded px-1 text-secondary-midnight"
            >
              save
            </div>
          )}
        </summary>
        <div className="mt-2 grid grid-cols-1 gap-y-2 sm:grid-cols-6">
          {fields.map((field) => (
            <div key={field} className="sm:col-span-6">
              <label htmlFor={toSnakeCase(field)} className="block text-sm font-medium leading-6 text-white">
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
                  className="block w-full rounded-md pl-4 border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          ))}
        </div>
      </details>
    )
  );
};
