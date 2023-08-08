import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectTemplateCreateInput
  extends Omit<databaseTypes.IProjectTemplate, '_id' | 'createdAt' | 'updatedAt'  | 'projects' | 'tags'> {
                projects: (mongooseTypes.ObjectId | databaseTypes.IProject)[];
                tags: (mongooseTypes.ObjectId | databaseTypes.ITag)[];
}
