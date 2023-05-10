import { atom, selector } from 'recoil';
import { projectAtom } from './project';
import { database as databaseTypes, web as webTypes } from '@glyphx/types';

// controls styling of state list items
export const activeStateAtom = atom<number>({
  key: 'activeStateAtom',
  default: -1,
});

export const cameraAtom = atom<webTypes.Camera | false>({
  key: 'cameraAtom',
  default: false,
});

// populates state list
export const stateSnapshotsSelector = selector<databaseTypes.IState[]>({
  key: 'stateSnapshopsSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    return project?.stateHistory.filter((state) => !state.deletedAt);
  },
});

export const stateSelector = selector({
  key: 'activeSnapshotSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    const activeStateIndex = get(activeStateAtom);
    return project?.stateHistory[activeStateIndex];
  },
});
