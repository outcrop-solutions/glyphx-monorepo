import { atom, selector } from 'recoil';
import { projectAtom } from './project';
import { database as databaseTypes } from '@glyphx/types';

// controls styling of state list items
export const activeStateAtom = atom<number>({
  key: 'activeStateAtom',
  default: -1,
});

// populates state list
export const stateSnapshotsSelector = selector<databaseTypes.IState[]>({
  key: 'stateSnapshopsSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    return project?.stateHistory.filter((state) => !state.deletedAt);
  },
});
