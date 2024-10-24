import {atom, selector} from 'recoil';
import {projectAtom} from './project';
import {databaseTypes, webTypes} from 'types';
import {hashPayload, hashFiles} from 'business/src/util/hashFunctions';
import {payloadHashSelector} from './model';

// controls styling of state list items
export const activeStateAtom = atom<string>({
  key: 'activeStateAtom',
  default: '',
});

export const isSubmittingAtom = atom<boolean>({
  key: 'isSubmittingAtom',
  default: false,
});

export const showStateInputAtom = atom<boolean>({
  key: 'showStateInputAtom',
  default: false,
});

export const activeStateNameAtom = atom<string>({
  key: 'activeStateNameAtom',
  default: '',
});

export const imageHashAtom = atom<webTypes.ImageHash>({
  key: 'imageHashAtom',
  default: {
    imageHash: false,
  },
});

export const cameraAtom = atom<webTypes.Camera | {}>({
  key: 'cameraAtom',
  default: {},
});

// populates state list
export const stateSnapshotsSelector = selector<databaseTypes.IState[]>({
  key: 'stateSnapshotsSelector',
  get: ({get}) => {
    const project = get(projectAtom);
    return project?.stateHistory.filter((state) => !state.deletedAt);
  },
});

export const stateSelector = selector({
  key: 'activeSnapshotSelector',
  get: ({get}) => {
    const project = get(projectAtom);
    const activeStateId = get(activeStateAtom);
    return project?.stateHistory.find((state) => state.id === activeStateId);
  },
});

/**
 * does current project's payload hash exist in it's stateHistory
 */
export const doesStateExistSelector = selector<boolean>({
  key: 'doesStateExistSelector',
  get: ({get}) => {
    const ph = get(payloadHashSelector);
    const states = get(stateSnapshotsSelector);
    return states.filter((state) => state?.payloadHash === ph).length > 0;
  },
});

export const hasDrawerBeenShownAtom = atom({
  key: 'hasDrawerBeenShownAtom',
  default: false,
});

// is active state fileHash the same as project fileHash
export const isFilterWritableSelector = selector<boolean>({
  key: 'isFilterWritableSelector',
  get: ({get}) => {
    const state = get(stateSelector);
    const project = get(projectAtom);
    return state?.fileSystemHash === hashFiles(project?.files);
  },
});
