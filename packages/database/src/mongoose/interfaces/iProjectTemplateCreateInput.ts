// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectTemplateCreateInput
  extends Omit<databaseTypes.IProjectTemplate, '_id' | 'createdAt' | 'updatedAt' | 'projects' | 'tags'> {
  projects: (string | databaseTypes.IProject)[];
  tags: (string | databaseTypes.ITag)[];
}
