import { atom, selector } from 'recoil';
import { projectAtom } from './project';
import { database as databaseTypes, web as webTypes } from '@glyphx/types';
import { hashPayload } from 'lib/utils/hashPayload';
import { hashFileSystem } from 'lib/utils/hashFileSystem';

// controls styling of state list items
export const activeStateAtom = atom<number>({
  key: 'activeStateAtom',
  default: -1,
});

export const cameraAtom = atom<webTypes.Camera | {}>({
  key: 'cameraAtom',
  default: {},
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

// does current project's payload hash exist in it's fileHistory
export const doesStateExistSelector = selector<boolean>({
  key: 'doesStateExistSelector',
  get: ({ get }) => {
    const project = get(projectAtom);
    if (!project?.files) return false;
    const currentPayloadHash = hashPayload(hashFileSystem(project.files), project);
    const exists = project?.stateHistory?.filter((state) => state?.payloadHash === currentPayloadHash);
    return exists.length > 0;
  },
});

// is active state fileHash the same as project fileHash
export const isFilterWritableSelector = selector<boolean>({
  key: 'isFilterWritableSelector',
  get: ({ get }) => {
    const state = get(stateSelector);
    const project = get(projectAtom);
    return state?.fileSystemHash === hashFileSystem(project?.files);
  },
});
