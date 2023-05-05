import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectDocument
  extends Omit<
    databaseTypes.IProject,
    'workspace' | 'type' | 'members' | 'stateHistory'
  > {
  workspace: mongooseTypes.ObjectId;
  members: mongooseTypes.ObjectId[];
  stateHistory: mongooseTypes.ObjectId[];
  type?: mongooseTypes.ObjectId;
}
