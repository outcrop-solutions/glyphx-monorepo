import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectTemplateDocument extends Omit<databaseTypes.IProjectTemplate, 'projects' | 'tags'> {
  projects: mongooseTypes.ObjectId[];
  tags: mongooseTypes.ObjectId[];
}
