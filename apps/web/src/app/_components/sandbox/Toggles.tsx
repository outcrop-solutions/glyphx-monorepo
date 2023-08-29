import React, { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { _updateConfig, api } from 'lib';
import { togglesConfigDirtyAtom, configSelector, currentConfigAtom } from 'state';
import { database as databaseTypes } from '@glyphx/types';
import { Toggle } from './Toggle';

const fields = ['Toggle Grid Lines', 'Toggle Glyph Offset', 'Toggle Z Offset'];

export const Toggles = () => {
  const config = useRecoilValue(configSelector);
  const currentConfig = useRecoilValue(currentConfigAtom);
  const [configDirty, _] = useRecoilState(togglesConfigDirtyAtom);

  const saveChanges = useCallback(async () => {
    await api({ ..._updateConfig(config?._id!.toString(), config as databaseTypes.IModelConfig) });
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
            <Toggle field={field} config={config} currentConfig={currentConfig} />
          ))}
        </div>
      </details>
    )
  );
};
