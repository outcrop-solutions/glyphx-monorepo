import React, {useCallback, useState} from 'react';
import produce from 'immer';
import {useRecoilState, useSetRecoilState} from 'recoil';
// import { _updateConfig, api } from 'lib';
import {togglesConfigDirtyAtom, configsAtom} from 'state';
import {toSnakeCase} from './toSnakeCase';

export const Toggle = ({field, config, currentConfig}) => {
  const setConfigs = useSetRecoilState(configsAtom);
  const [checked, setChecked] = useState(config[toSnakeCase(field)]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [configDirty, setConfigDirty] = useRecoilState(togglesConfigDirtyAtom);

  const handleChange = useCallback(
    (idx: number, prop: string, value) => {
      setConfigs(
        produce((draft) => {
          draft[idx][prop] = value;
        })
      );
      setChecked((prev) => !prev);
      setConfigDirty(true);
    },
    [setConfigDirty, setConfigs]
  );

  // const saveChanges = useCallback(async () => {
  //   await api({ ..._updateConfig(config?._id.toString(), config as databaseTypes.IModelConfig) });
  // }, [config]);

  return (
    <div key={field} className="relative flex items-start">
      <div className="flex h-6 items-center">
        <input
          id={toSnakeCase(field)}
          name={toSnakeCase(field)}
          onChange={(ev) => handleChange(currentConfig, toSnakeCase(field), ev.target.checked)}
          type="checkbox"
          checked={checked}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600"
        />
      </div>
      <div className="ml-3 text-sm leading-6">
        <label htmlFor="comments" className="font-medium text-white">
          {field}
        </label>
      </div>
    </div>
  );
};
