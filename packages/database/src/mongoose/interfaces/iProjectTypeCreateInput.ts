import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectTypeCreateInput
  extends Omit<databaseTypes.IProjectType, '_id' | 'projects'> {
  projects: (mongooseTypes.ObjectId | databaseTypes.IProject)[];
}
