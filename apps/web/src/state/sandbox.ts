import { atom, atomFamily, selector } from 'recoil';
import { database as databaseTypes } from '@glyphx/types';

export const configsAtom = atom<Partial<databaseTypes.IModelConfig>[]>({
  key: 'configsAtomKey',
  default: [],
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
  get: ({ get }) => {
    const configs = get(configsAtom);
    const currentConfig = get(currentConfigAtom);
    return configs[currentConfig];
  },
});

export const configNameDirtyFamily = atomFamily({
  key: 'configNameDirtyFamily',
  default: false,
});

export const configNameSelector = selector<string[]>({
  key: 'configNameSelector',
  get: ({ get }) => {
    const configs = get(configsAtom);
    return configs.map((config) => config.name);
  },
});
