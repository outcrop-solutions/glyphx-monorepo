import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectCreateInput
  extends Omit<
    databaseTypes.IProject,
    '_id' | 'createdAt' | 'updatedAt' | 'workspace' | 'type' | 'owner' | 'state'
  > {
  workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
  type?: mongooseTypes.ObjectId | databaseTypes.IProjectType;
  owner: mongooseTypes.ObjectId | databaseTypes.IUser;
  state?: mongooseTypes.ObjectId | databaseTypes.IState;
}
