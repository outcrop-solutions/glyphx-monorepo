import React, {useCallback, useState} from 'react';
import produce from 'immer';
import {useRecoilState, useSetRecoilState} from 'recoil';
import {togglesConfigDirtyAtom, configsAtom} from 'state';
import {toSnakeCase} from './toSnakeCase';

export const Toggle = ({field, config, currentConfig}) => {
  const setConfigs = useSetRecoilState(configsAtom);
  const [checked, setChecked] = useState(config[toSnakeCase(field)]);
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

  return (
    <div key={field} className="relative flex items-start px-2">
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
      <div className="ml-3 text-xs leading-6">
        <label htmlFor="comments" className="font-medium text-white">
          {field}
        </label>
      </div>
    </div>
  );
};
