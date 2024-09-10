import {atom, selector} from 'recoil';
import {projectAtom} from './project';
import {databaseTypes, webTypes} from 'types';
import {HashResolver, LatestHashStrategy} from 'business/src/util/HashResolver';
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

// does current project's payload hash exist in it's stateHistory
export const doesStateExistSelector = selector<boolean>({
  key: 'doesStateExistSelector',
  get: ({get}) => {
    const project = get(projectAtom);
    if (!project?.files) return false;

    // this and the 'isFilterWriteableSelector' is the exception to the HashResolver because we can't expose the s3 connection details to the client here unfortunately
    const s = new LatestHashStrategy();
    const currentPayloadHash = s.hashPayload(s.hashFiles(project.files), project);
    const exists = project?.stateHistory?.filter((state) => state?.payloadHash === currentPayloadHash);
    return exists.length > 0;
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
    // this and the 'doesStateExistSelector' is the exception to the HashResolver because we can't expose the s3 connection details to the client here unfortunately
    const s = new LatestHashStrategy();
    return state?.fileSystemHash === s.hashFiles(project?.files);
  },
});
