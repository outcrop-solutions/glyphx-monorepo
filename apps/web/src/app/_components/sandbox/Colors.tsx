import produce from 'immer';
import React, {useCallback} from 'react';
import {SketchPicker} from 'react-color';

import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {configSelector, configsAtom, currentConfigAtom, colorsConfigDirtyAtom} from 'state';
import {toSnakeCase} from './toSnakeCase';
import {_updateConfig, api} from 'lib';
import {databaseTypes} from 'types';
const fields = ['Max Color', 'Min Color', 'Background Color', 'X Axis Color', 'Y Axis Color', 'Z Axis Color'];

export const Colors = () => {
  const config = useRecoilValue(configSelector);
  const setConfigs = useSetRecoilState(configsAtom);
  const currentConfig = useRecoilValue(currentConfigAtom);
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

  const saveChanges = useCallback(async () => {
    await api({
      ..._updateConfig(config?._id!.toString(), config as databaseTypes.IModelConfig),
      setLoading: (loading) => setConfigDirty(loading as boolean),
    });
  }, [config, setConfigDirty]);

  return (
    config && (
      <details className="py-2">
        <summary className="flex items-center justify-between text-base font-semibold leading-7 text-white cursor-pointer mb-4">
          Colors
          {configDirty && (
            <div
              onClick={saveChanges}
              className="bg-yellow hover:bg-primary-yellow rounded px-1 text-secondary-midnight"
            >
              save
            </div>
          )}
        </summary>
        <div className="space-y-5">
          {fields.map((field) => (
            <details key={field} className="ml-2">
              <summary className="text-sm text-white font-bold mb-2">{field}</summary>
              <SketchPicker
                color={config[toSnakeCase(field)]}
                onChange={({rgb}) => handleChange(currentConfig, toSnakeCase(field), rgb)}
              />
            </details>
          ))}
        </div>
      </details>
    )
  );
};