import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectTypeDocument
  extends Omit<databaseTypes.IProjectType, '_id' | 'projects'> {
  projects: mongooseTypes.ObjectId[];
}
