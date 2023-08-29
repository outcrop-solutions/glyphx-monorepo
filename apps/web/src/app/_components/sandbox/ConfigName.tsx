import produce from 'immer';
import React, { useCallback, useRef, useState } from 'react';
import ClickAwayListener from 'react-click-away-listener';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { configNameDirtyFamily, configsAtom, currentConfigAtom } from 'state';
import { _updateConfig, _deleteConfig, api } from 'lib';
import { CheckCircleIcon, TrashIcon } from '@heroicons/react/outline';
import { database as databaseTypes } from '@glyphx/types';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export const ConfigName = ({ config, idx }) => {
  const [selected, setSelected] = useState(false);
  const setConfigs = useSetRecoilState(configsAtom);
  const [configDirty, setConfigDirty] = useRecoilState(configNameDirtyFamily(idx));
  const currentConfig = useRecoilValue(currentConfigAtom);
  const ref = useRef(null);

  const saveChanges = useCallback(async () => {
    await api({
      ..._updateConfig(config?._id.toString(), config as databaseTypes.IModelConfig),
      setLoading: (loading) => setConfigDirty(loading as boolean),
      onSuccess: () => setSelected(false),
    });
  }, [config, setConfigDirty]);

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

  const handleDelete = useCallback(async () => {
    await api({
      ..._deleteConfig(config._id),
    });
  }, [config._id]);

  return (
    <ClickAwayListener onClickAway={() => setSelected(false)}>
      {selected ? (
        <div className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-white">
            {idx + 1}
          </span>
          <input
            autoFocus
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
          className={classNames(
            idx === currentConfig ? 'bg-gray-800 text-white' : 'text-white hover:bg-gray-800',
            'group flex relative gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
          )}
        >
          <span
            onClick={() => {
              setSelected(true);
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white"
          >
            {idx + 1}
          </span>
          <span
            onClick={() => {
              setSelected(true);
            }}
            className="truncate"
          >
            {config?.name}
          </span>
          <div className="grow flex items-center justify-end">
            <TrashIcon onClick={handleDelete} className="w-5 h-5 text-white cursor-pointer" />
          </div>
        </div>
      )}
    </ClickAwayListener>
  );
};
