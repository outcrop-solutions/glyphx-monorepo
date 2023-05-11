import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectCreateInput
  extends Omit<
    databaseTypes.IProject,
    '_id' | 'createdAt' | 'updatedAt' | 'workspace' | 'members' | 'type'
  > {
  workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
  members: (mongooseTypes.ObjectId | databaseTypes.IMember)[];
  type?: mongooseTypes.ObjectId | databaseTypes.IProjectType;
}
