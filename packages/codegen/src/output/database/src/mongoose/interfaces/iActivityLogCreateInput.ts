// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IActivityLogCreateInput
  extends Omit<databaseTypes.IActivityLog, '_id' | 'createdAt' | 'updatedAt'  | 'actor' | 'workspace' | 'project' | 'userAgent'> {
            actor: mongooseTypes.ObjectId | databaseTypes.IUser;
            workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
            project: mongooseTypes.ObjectId | databaseTypes.IProject;
            userAgent: mongooseTypes.ObjectId | databaseTypes.IUserAgent;
}
