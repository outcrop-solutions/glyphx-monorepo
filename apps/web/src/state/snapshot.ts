import { selectorFamily } from 'recoil';
import { projectAtom } from './project';
import { database as databaseTypes } from '@glyphx/types';
import { Types as mongooseTypes } from 'mongoose';

export interface IStateCreateInput
  extends Omit<databaseTypes.IState, '_id' | 'createdAt' | 'updatedAt' | 'project' | 'createdBy'> {
  project: mongooseTypes.ObjectId | string;
  createdBy: string;
}

// used in createStateSnapshot mutation
export const stateSnapshopPayloadSelector = selectorFamily<IStateCreateInput, string>({
  key: 'stateSnapshopPayloadSelector',
  get:
    (userId) =>
    ({ get }) => {
      const project = get(projectAtom);
      return {
        createdBy: userId,
        version: project.currentVersion++,
        static: false,
        camera: 0,
        properties: project.state.properties,
        fileSystemHash: project.state.fileSystemHash,
        project: project._id,
        fileSystem: project?.files,
      };
    },
});
