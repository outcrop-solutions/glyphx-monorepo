import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectDocument
  extends Omit<
    databaseTypes.IProject,
    'workspace' | 'type' | 'owner' | 'members'
  > {
  workspace: mongooseTypes.ObjectId;
  members: mongooseTypes.ObjectId[];
  type?: mongooseTypes.ObjectId;
  owner: mongooseTypes.ObjectId;
}
