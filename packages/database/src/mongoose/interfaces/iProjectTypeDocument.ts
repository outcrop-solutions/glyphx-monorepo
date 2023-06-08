import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectTemplateDocument
  extends Omit<databaseTypes.IProjectTemplate, 'projects'> {
  projects: mongooseTypes.ObjectId[];
}
