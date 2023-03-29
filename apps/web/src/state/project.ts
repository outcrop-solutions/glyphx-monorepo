import { atom } from 'recoil';
import { database as databaseTypes } from '@glyphx/types';

export const projectAtom = atom<databaseTypes.IProject | null>({
  key: 'projectAtom',
  default: null,
});

// payload will be dynamically constructed