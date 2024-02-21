import React, {startTransition} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {togglesConfigDirtyAtom, configSelector, currentConfigAtom} from 'state';
import {databaseTypes} from 'types';
import {Toggle} from './Toggle';
import {updateConfig} from 'business/src/actions';

const fields = ['Toggle Grid Lines', 'Toggle Glyph Offset', 'Toggle Z Offset'];

export const Toggles = () => {
  const config = useRecoilValue(configSelector);
  const currentConfig = useRecoilValue(currentConfigAtom);
  const [configDirty] = useRecoilState(togglesConfigDirtyAtom);

  return (
    config && (
      <details className="py-2">
        <summary className="flex items-center justify-between text-base font-semibold leading-7 text-white cursor-pointer">
          Toggles{' '}
          {configDirty && (
            <div
              onClick={() =>
                startTransition(() =>
                  // @ts-ignore
                  updateConfig(config?.id, config as databaseTypes.IModelConfig)
                )
              }
              className="bg-yellow hover:bg-primary-yellow rounded px-1 text-secondary-midnight"
            >
              save
            </div>
          )}
        </summary>
        <div className="space-y-5 mt-4">
          {fields.map((field, idx) => (
            <Toggle key={idx} field={field} config={config} currentConfig={currentConfig} />
          ))}
        </div>
      </details>
    )
  );
};
