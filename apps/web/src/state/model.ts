import {atom, selector, selectorFamily} from 'recoil';
import {projectAtom} from './project';
import {LatestHashStrategy} from 'business/src/util/HashResolver';
import {rustGlyphEngineTypes} from 'types';

const s = new LatestHashStrategy();
/**
 * Globally available modelRunner init because recoil allows async initializers for selectors
 */
// const wasmUrl = '/pkg/glyphx_cube_model_bg.wasm';
export const modelRunnerSelector = atom<any>({
  key: 'modelRunnerSelector',
  default: null,
});

/**
 * The latest state object in crono order
 */
export const lastStateSelector = selector({
  key: 'lastStateSelector',
  get: ({get}) => {
    const project = get(projectAtom);
    const filtered = project?.stateHistory.filter((state) => !state.deletedAt) ?? [];
    if (filtered?.length > 0) {
      const idx = filtered.length - 1;
      return filtered[idx];
    } else {
      return false;
    }
  },
});
/**
 * The calculated file hash of the project's current state
 */
const fileHashSelector = selector<string | null>({
  key: 'filehashSelector',
  get: ({get}) => {
    const project = get(projectAtom);
    if (project?.files) {
      return s.hashFiles(project.files);
    } else {
      return null;
    }
  },
});
/**
 * The calculated payload hash of the project's current state
 */
export const payloadHashSelector = selector<string | null>({
  key: 'paylodHashSelector',
  get: ({get}) => {
    const project = get(projectAtom);
    const fh = get(fileHashSelector);
    const payload = {
      projectId: project.id!,
      files: project.files,
      properties: project.state.properties,
    };

    if (fh) {
      const ph = s.hashPayload(fh, payload);
      console.log('selectorHash', {ph});
      return ph;
    } else {
      return null;
    }
  },
});

export const shouldClearSelector = selector<boolean>({
  key: 'shouldClearSelector',
  get: ({get}) => {
    const lastState = get(lastStateSelector);
    const currentlyLoaded = get(currentModelAtom);
    return !!(lastState || currentlyLoaded);
  },
});

/**
 * The data urls of the data files backing the currently rendered state
 */
export const modelDataAtom = atom<{GLY_URL: string; STS_URL: string; X_VEC: string; Y_VEC: string}>({
  key: 'modelDataAtom',
  default: {
    GLY_URL: '',
    STS_URL: '',
    X_VEC: '',
    Y_VEC: '',
  },
});

/**
 * The payload hash of the currently loaded state
 * Changes to the curent model triggers calculation of new camera, glyph count, stats values
 */
export const currentModelAtom = atom<boolean>({
  key: 'currentModelAtom',
  default: false,
});

/**
 * Current camera data
 */
export const cameraSelector = selector<rustGlyphEngineTypes.ICameraData | null>({
  key: 'cameraSelector',
  get: ({get}) => {
    const modelRunner = get(modelRunnerSelector);
    if (!modelRunner) return null;
    return JSON.parse(modelRunner.get_camera_data());
  },
});

/**
 * Stats & Counts
 */
export const statsCountSelector = selector<number | null>({
  key: 'statsCountSelector',
  get: ({get}) => {
    const modelRunner = get(modelRunnerSelector);
    if (!modelRunner) return null;
    return modelRunner.get_stats_count();
  },
});

export const glyphCountSelector = selector<number | null>({
  key: 'glyphCountSelector',
  get: ({get}) => {
    const modelRunner = get(modelRunnerSelector);
    if (!modelRunner) return null;
    return modelRunner.get_glyph_count();
  },
});

export const xVecCountSelector = selector<number | null>({
  key: 'xVecCountSelector',
  get: ({get}) => {
    const modelRunner = get(modelRunnerSelector);
    if (!modelRunner) return null;
    return modelRunner.get_x_vector_count();
  },
});

export const yVecCountSelector = selector<number | null>({
  key: 'yVecCountSelector',
  get: ({get}) => {
    const modelRunner = get(modelRunnerSelector);
    if (!modelRunner) return null;
    return modelRunner.get_y_vector_count();
  },
});
/**
 * Gives the statistics on an axis-by-acxis basis
 */
export const statsSelectorFamily = selectorFamily<string, any>({
  key: 'statsSelector',
  get:
    (axis: string) =>
    ({get}) => {
      const modelRunner = get(modelRunnerSelector);
      if (!modelRunner) return null;
      return JSON.parse(modelRunner.get_statistics(axis));
    },
});
