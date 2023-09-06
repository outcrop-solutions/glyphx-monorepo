import {selector} from 'recoil';
import {databaseTypes} from 'types';
import {activeStateAtom, stateSelector} from './snapshot';
import {projectAtom} from './project';
import {Types as mongooseTypes} from 'mongoose';

export const annotationResourceIdSelector = selector<{
  type: databaseTypes.constants.ANNOTATION_TYPE;
  id: mongooseTypes.ObjectId | string;
}>({
  key: 'annotationIdSelector',
  get: ({get}) => {
    const activeStateIndex = get(activeStateAtom);
    const state = get(stateSelector);
    const project = get(projectAtom);
    if (activeStateIndex === -1) {
      return {type: databaseTypes.constants.ANNOTATION_TYPE.PROJECT, id: project?._id};
    } else {
      return {type: databaseTypes.constants.ANNOTATION_TYPE.STATE, id: state?._id};
    }
  },
});
