import produce from 'immer';
import React, { useCallback } from 'react';
import { SketchPicker } from 'react-color';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { configSelector, configsAtom, currentConfigAtom } from 'state';
import { toSnakeCase } from './toSnakeCase';

const fields = ['Max Color', 'Min Color', 'Background Color', 'X Axis Color', 'Y Axis Color', 'Z Axis Color'];

export const Colors = () => {
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
      <summary className="text-base font-semibold leading-7 text-white cursor-pointer mb-4">Colors</summary>
      <div className="space-y-5">
        {fields.map((field) => (
          <details className="ml-2">
            <summary className="text-sm text-white font-bold mb-2">{field}</summary>
            <SketchPicker
              onChange={({ rgb }, _) => handleChange(currentConfig, toSnakeCase(field), [rgb.r, rgb.g, rgb.b, rgb.a])}
            />
          </details>
        ))}
      </div>
    </details>
  );
};
