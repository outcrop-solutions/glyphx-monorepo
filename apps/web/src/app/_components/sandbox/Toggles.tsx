import React, { useCallback } from 'react';
import produce from 'immer';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { _updateConfig, api } from 'lib';
import { togglesConfigDirtyAtom, configSelector, configsAtom, currentConfigAtom } from 'state';
import { database as databaseTypes } from '@glyphx/types';
import { toSnakeCase } from './toSnakeCase';

const fields = ['Toggle Grid Lines', 'Toggle Glyph Offset', 'Toggle Z Offset'];

export const Toggles = () => {
  const config = useRecoilValue(configSelector);
  const setConfigs = useSetRecoilState(configsAtom);
  const currentConfig = useRecoilValue(currentConfigAtom);
  const [configDirty, setConfigDirty] = useRecoilState(togglesConfigDirtyAtom);

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
    await api({ ..._updateConfig(config?._id.toString(), config as databaseTypes.IModelConfig) });
  }, [config]);

  return (
    config && (
      <details className="py-2">
        <summary className="flex items-center justify-between text-base font-semibold leading-7 text-white cursor-pointer">
          Toggles{' '}
          {configDirty && (
            <div
              onClick={saveChanges}
              className="bg-yellow hover:bg-primary-yellow rounded px-1 text-secondary-midnight"
            >
              save
            </div>
          )}
        </summary>
        <div className="space-y-5 mt-4">
          {fields.map((field) => (
            <div key={field} className="relative flex items-start">
              <div className="flex h-6 items-center">
                <input
                  id={toSnakeCase(field)}
                  name={toSnakeCase(field)}
                  placeholder={config[toSnakeCase(field)]}
                  value={config[toSnakeCase(field)]}
                  onChange={(ev) => handleChange(currentConfig, toSnakeCase(field), ev.target.value)}
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                />
              </div>
              <div className="ml-3 text-sm leading-6">
                <label htmlFor="comments" className="font-medium text-white">
                  {field}
                </label>
              </div>
            </div>
          ))}
        </div>
      </details>
    )
  );
};
