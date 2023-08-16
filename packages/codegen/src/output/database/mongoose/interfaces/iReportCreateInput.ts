// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IReportCreateInput
  extends Omit<
    databaseTypes.IReport,
    | '_id'
    | 'createdAt'
    | 'updatedAt'
    | 'comments'
    | 'author'
    | 'workspace'
    | 'projects'
  > {
  comments: (mongooseTypes.ObjectId | databaseTypes.IComment)[];
  author: mongooseTypes.ObjectId | databaseTypes.IUser;
  workspace: mongooseTypes.ObjectId | databaseTypes.IWorkspace;
  projects: (mongooseTypes.ObjectId | databaseTypes.IProject)[];
}
