import { selector } from 'recoil';
import { database as databaseTypes } from '@glyphx/types';
import { activeStateAtom, stateSelector } from './snapshot';
import { projectAtom } from './project';
import { Types as mongooseTypes } from 'mongoose';

export const annotationResourceIdSelector = selector<{
  type: databaseTypes.constants.ANNOTATION_TYPE;
  id: mongooseTypes.ObjectId | string;
}>({
  key: 'annotationIdSelector',
  get: ({ get }) => {
    const activeStateIndex = get(activeStateAtom);
    const stateId = get(stateSelector)?._id;
    const projectId = get(projectAtom)?._id;
    if (activeStateIndex !== -1) {
      return { type: databaseTypes.constants.ANNOTATION_TYPE.PROJECT, id: projectId };
    } else {
      return { type: databaseTypes.constants.ANNOTATION_TYPE.STATE, id: stateId };
    }
  },
});
