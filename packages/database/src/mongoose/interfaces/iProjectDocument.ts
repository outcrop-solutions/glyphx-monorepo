import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectDocument
  extends Omit<
    databaseTypes.IProject,
    'workspace' | 'template' | 'members' | 'stateHistory' | 'tags'
  > {
  workspace: mongooseTypes.ObjectId;
  members: mongooseTypes.ObjectId[];
  stateHistory: mongooseTypes.ObjectId[];
  tags: mongooseTypes.ObjectId[];
  template?: mongooseTypes.ObjectId;
}
