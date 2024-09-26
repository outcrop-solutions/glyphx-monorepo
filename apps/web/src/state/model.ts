import {atom, selector} from 'recoil';
import {projectAtom} from './project';
import {LatestHashStrategy} from 'business/src/util/HashResolver';
// model runner!
export const modelRunnerAtom = atom<any>({
  key: 'modelRunnerAtom',
  default: {initialized: false, modelRunner: {}, lastPayloadHash: ''},
});

export const payloadHashSelector = selector<string>({
  key: 'paylodHashSelector',
  get: ({get}) => {
    const project = get(projectAtom);
    const s = new LatestHashStrategy();
    if (project?.files) {
      const fileHash = s.hashFiles(project.files);
      const payload = {
        projectId: project.id!,
        files: project.files,
        properties: project.state.properties,
      };
      return s.hashPayload(fileHash, payload);
    } else {
      return '';
    }
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
