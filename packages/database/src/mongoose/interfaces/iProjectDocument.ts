import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectDocument
  extends Omit<databaseTypes.IProject, 'workspace' | 'type' | 'owner'> {
  workspace: mongooseTypes.ObjectId;
  type?: mongooseTypes.ObjectId;
  owner: mongooseTypes.ObjectId;
}
