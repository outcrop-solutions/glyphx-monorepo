// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IActivityLogCreateInput
  extends Omit<
    databaseTypes.IActivityLog,
    '_id' | 'createdAt' | 'updatedAt' | 'actor' | 'workspace' | 'project' | 'userAgent'
  > {
  actor: string | databaseTypes.IUser;
  workspace: string | databaseTypes.IWorkspace;
  project: string | databaseTypes.IProject;
  userAgent: string | databaseTypes.IUserAgent;
}
