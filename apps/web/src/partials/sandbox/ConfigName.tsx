import produce from 'immer';
import React, { useCallback, useState } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { configNameDirtyFamily, configSelector, configsAtom, currentConfigAtom } from 'state';
import { _updateConfig, api } from 'lib';
import { CheckCircleIcon } from '@heroicons/react/outline';
import { database as databaseTypes } from '@glyphx/types';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const ConfigName = ({ config, idx }) => {
  const [selected, setSelected] = useState(false);
  const setConfigs = useSetRecoilState(configsAtom);
  const [configDirty, setConfigDirty] = useRecoilState(configNameDirtyFamily(idx));
  const currentConfig = useRecoilValue(currentConfigAtom);

  const saveChanges = useCallback(async () => {
    await api({ ..._updateConfig(config?._id.toString(), config as databaseTypes.IModelConfig) });
    setSelected(false);
  }, [config]);

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
    <ClickAwayListener onClickAway={() => setSelected(false)}>
      {selected ? (
        <div className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-white">
            {idx + 1}
          </span>
          <input
            placeholder={config?.name}
            onChange={(ev) => handleChange(currentConfig, 'name', ev.target.value)}
            className="bg-transparent text-white"
          />
          {configDirty && (
            <CheckCircleIcon onClick={saveChanges} className="h-6 w-6 text-white hover:text-bright-blue" />
          )}
        </div>
      ) : (
        <div
          onClick={() => setSelected(true)}
          className={classNames(
            idx === currentConfig ? 'bg-gray-800 text-white' : 'text-white hover:bg-gray-800',
            'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
          )}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">
            {idx + 1}
          </span>
          <span className="truncate">{config?.name}</span>
        </div>
      )}
    </ClickAwayListener>
  );
};
