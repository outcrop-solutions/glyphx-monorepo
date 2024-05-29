import {hashFileSystem, hashPayload} from 'business/src/util/hashFunctions';
import {atom, selector} from 'recoil';
import {projectAtom} from './project';

// model runner!
export const modelRunnerAtom = atom<any>({
  key: 'modelRunnerAtom',
  default: {initialized: false, modelRunner: {}, lastPayloadHash: ''},
});

export const payloadHashSelector = selector<string>({
  key: 'paylodHashSelector',
  get: ({get}) => {
    const project = get(projectAtom);
    return hashPayload(hashFileSystem(project.files), project);
  },
});

export const modelDataAtom = atom<{GLY_URL: string; STS_URL: string; X_VEC: string; Y_VEC: string}>({
  key: 'modelDataAtom',
  default: {
    GLY_URL: '',
    STS_URL: '',
    X_VEC: '',
    Y_VEC: '',
  },
});
