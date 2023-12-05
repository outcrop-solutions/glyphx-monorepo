// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectCreateInput
  extends Omit<
    databaseTypes.IProject,
    '_id' | 'createdAt' | 'updatedAt' | 'workspace' | 'template' | 'members' | 'tags' | 'states' | 'filesystem'
  > {
  workspace: string | databaseTypes.IWorkspace;
  template: string | databaseTypes.IProjectTemplate;
  members: (string | databaseTypes.IMember)[];
  tags: (string | databaseTypes.ITag)[];
  states: (string | databaseTypes.IState)[];
  filesystem: (string | databaseTypes.IFileStats)[];
}
