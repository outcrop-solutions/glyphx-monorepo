import { atom, selector } from 'recoil';
import { web as webTypes } from '@glyphx/types';

export const configsAtom = atom<webTypes.IModelConfig[]>({
  key: 'configsAtomKey',
  default: [
    {
      name: 'Default Config',
      current: true,
      min_color: [0, 0, 0],
      max_color: [0, 0, 0],
      background_color: [0, 0, 0],
      x_axis_color: [0, 0, 0],
      y_axis_color: [0, 0, 0],
      z_axis_color: [0, 0, 0],
      grid_cylinder_radius: 0,
      grid_cylinder_length: 0,
      grid_cone_length: 0,
      grid_cone_radius: 0,
      glyph_offset: 0,
      z_height_ratio: 0,
      z_offset: 0,
    },
  ],
});

export const currentConfigAtom = atom<number>({
  key: 'currentConfigIndexKey',
  default: 0,
});

export const configSelector = selector<webTypes.IModelConfig>({
  key: 'sandboxConfigAtomKey',
  get: ({ get }) => {
    const configs = get(configsAtom);
    const currentConfig = get(currentConfigAtom);
    return configs[currentConfig];
  },
});

export const configNameSelector = selector<string[]>({
  key: 'configNameSelector',
  get: ({ get }) => {
    const configs = get(configsAtom);
    return configs.map((config) => config.name);
  },
});
