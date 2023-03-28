import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectTypeDocument
  extends Omit<databaseTypes.IProjectType, 'projects'> {
  projects: mongooseTypes.ObjectId[];
}
