import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IWorkspaceCreateInput
  extends Omit<databaseTypes.IWorkspace, '_id' | 'createdAt' | 'updatedAt'  | 'tags' | 'creator' | 'members' | 'projects' | 'states'> {
                tags: (mongooseTypes.ObjectId | databaseTypes.ITag)[];
            creator: mongooseTypes.ObjectId | databaseTypes.IUser;
                members: (mongooseTypes.ObjectId | databaseTypes.IMember)[];
                projects: (mongooseTypes.ObjectId | databaseTypes.IProject)[];
                states: (mongooseTypes.ObjectId | databaseTypes.IState)[];
}
