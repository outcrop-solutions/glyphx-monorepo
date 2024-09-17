import {atom, selector} from 'recoil';
import {projectAtom} from './project';
import {databaseTypes, webTypes} from 'types';
// controls styling of state list items
export const activeStateAtom = atom<string>({
  key: 'activeStateAtom',
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

export const hasDrawerBeenShownAtom = atom({
  key: 'hasDrawerBeenShownAtom',
  default: false,
});
