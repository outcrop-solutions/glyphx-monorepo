import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectCreateInput
  extends Omit<databaseTypes.IProject, '_id' | 'createdAt' | 'updatedAt'  | 'workspace' | 'template' | 'members' | 'tags' | 'stateHistory' | 'files'> {
            workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
            template: mongooseTypes.ObjectId | databaseTypes.IProjectTemplate;
                members: (mongooseTypes.ObjectId | databaseTypes.IMember)[];
                tags: (mongooseTypes.ObjectId | databaseTypes.ITag)[];
                stateHistory: (mongooseTypes.ObjectId | databaseTypes.IState)[];
                files: (mongooseTypes.ObjectId | databaseTypes.IFileStats)[];
}
