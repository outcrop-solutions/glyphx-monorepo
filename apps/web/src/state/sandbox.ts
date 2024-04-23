import {atom, atomFamily, selector} from 'recoil';
import {databaseTypes} from 'types';

export const configsAtom = atom<Partial<databaseTypes.IModelConfig>[]>({
  key: 'configsAtomKey',
  default: [
    {
      min_color: {r: 0, g: 0, b: 0, a: 1},
      max_color: {r: 0, g: 0, b: 0, a: 1},
      background_color: {r: 0, g: 0, b: 0, a: 1},
      x_axis_color: {r: 0, g: 0, b: 0, a: 1},
      y_axis_color: {r: 0, g: 0, b: 0, a: 1},
      z_axis_color: {r: 0, g: 0, b: 0, a: 1},
      grid_cylinder_radius: 25.0,
      grid_cylinder_length: 26.0,
      grid_cone_length: 27.0,
      grid_cone_radius: 28.0,
      glyph_offset: 29.0,
      z_height_ratio: 30.0,
    },
  ],
});

// editor state
export const togglesConfigDirtyAtom = atom<boolean>({
  key: 'togglesConfigDirtyAtom',
  default: false,
});

export const radiusConfigDirtyAtom = atom<boolean>({
  key: 'radiusConfigDirtyAtom',
  default: false,
});

export const colorsConfigDirtyAtom = atom<boolean>({
  key: 'colorsConfigDirtyAtom',
  default: false,
});

export const currentConfigAtom = atom<number>({
  key: 'currentConfigIndexKey',
  default: 0,
});

export const configSelector = selector<Partial<databaseTypes.IModelConfig>>({
  key: 'sandboxConfigAtomKey',
  get: ({get}) => {
    const configs = get(configsAtom);
    const currentConfig = get(currentConfigAtom);
    if (configs?.length > 0) {
      return configs[currentConfig];
    } else {
      return {};
    }
  },
});

export const configNameDirtyFamily = atomFamily({
  key: 'configNameDirtyFamily',
  default: false,
});
