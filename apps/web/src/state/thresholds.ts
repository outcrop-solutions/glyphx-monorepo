import {selector} from 'recoil';
import {projectAtom} from './project';
import {databaseTypes} from 'types';

// populates thresholds
export const thresholdsSelector = selector<databaseTypes.IThreshold[]>({
  key: 'thresholdsSelector',
  get: ({get}) => {
    const project = get(projectAtom);
    return project?.thresholds.filter((threshold) => !threshold.deletedAt);
  },
});
