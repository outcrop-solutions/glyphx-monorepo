import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IStateCreateInput
  extends Omit<databaseTypes.IState, '_id' | 'createdAt' | 'updatedAt'  | 'createdBy' | 'project' | 'workspace' | 'fileSystem'> {
            createdBy: mongooseTypes.ObjectId | databaseTypes.IUser;
            project: mongooseTypes.ObjectId | databaseTypes.IProject;
            workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
                fileSystem: (mongooseTypes.ObjectId | databaseTypes.IFileStats)[];
}
