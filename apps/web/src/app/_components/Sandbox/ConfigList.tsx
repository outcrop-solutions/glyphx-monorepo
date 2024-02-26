import React, {useTransition} from 'react';
import {ConfigName} from './ConfigName';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {configsAtom, currentConfigAtom} from 'state';
import {PlusCircleIcon} from '@heroicons/react/outline';
import {createConfig} from 'actions';

const DEFAULT_CONFIG = {
  name: 'Default Config',
  current: true,
  min_color: {r: 0, g: 0, b: 0, a: 0},
  max_color: {r: 0, g: 0, b: 0, a: 0},
  background_color: {r: 0, g: 0, b: 0, a: 0},
  x_axis_color: {r: 0, g: 0, b: 0, a: 0},
  y_axis_color: {r: 0, g: 0, b: 0, a: 0},
  z_axis_color: {r: 0, g: 0, b: 0, a: 0},
  grid_cylinder_radius: 0,
  grid_cylinder_length: 0,
  grid_cone_length: 0,
  grid_cone_radius: 0,
  glyph_offset: 0,
  z_height_ratio: 0,
  z_offset: 0,
  toggle_grid_lines: true,
  toggle_glyph_offset: true,
  toggle_z_offset: true,
};

export const ConfigList = () => {
  const configs = useRecoilValue(configsAtom);
  const [isPending, startTransition] = useTransition();
  const setCurrentConfig = useSetRecoilState(currentConfigAtom);

  return (
    <details>
      <summary className="flex items-center justify-between text-base font-semibold leading-7 text-white cursor-pointer py-2">
        Configurations
        <PlusCircleIcon
          onClick={() =>
            startTransition(async () => {
              await createConfig(DEFAULT_CONFIG);
            })
          }
          className="w-6 h-6"
        />
      </summary>
      {configs && (
        <ul role="list" className="-mx-2 mt-2 space-y-1">
          {configs.map((config, idx) => (
            <li onClick={() => setCurrentConfig(idx)} key={idx}>
              <ConfigName config={config} idx={idx} />
            </li>
          ))}
        </ul>
      )}
    </details>
  );
};
