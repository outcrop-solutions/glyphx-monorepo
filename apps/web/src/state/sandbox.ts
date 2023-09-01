import { atom, atomFamily, selector } from 'recoil';
import { databaseTypes } from 'types';

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
