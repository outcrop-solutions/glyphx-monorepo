import {databaseTypes} from 'types';

export interface IProjectTemplateCreateInput extends Omit<databaseTypes.IProjectTemplate, '_id' | 'projects' | 'tags'> {
  projects: (string | databaseTypes.IProject)[];
  tags: (string | databaseTypes.ITag)[];
}
