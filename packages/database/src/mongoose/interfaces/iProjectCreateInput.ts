import {databaseTypes} from 'types';

export interface IProjectCreateInput
  extends Omit<
    databaseTypes.IProject,
    '_id' | 'createdAt' | 'updatedAt' | 'workspace' | 'members' | 'template' | 'tags'
  > {
  workspace: string | databaseTypes.IWorkspace;
  tags: (string | databaseTypes.ITag)[];
  members: (string | databaseTypes.IMember)[];
  template?: string | databaseTypes.IProjectTemplate;
}
