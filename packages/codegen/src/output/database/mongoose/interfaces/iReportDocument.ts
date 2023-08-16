// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from '../../../../../database';
import {Types as mongooseTypes} from 'mongoose';

export interface IReportDocument
  extends Omit<
    databaseTypes.IReport,
    'comments' | 'author' | 'workspace' | 'projects'
  > {
  comments: mongooseTypes.ObjectId[];
  author: mongooseTypes.ObjectId;
  workspace: mongooseTypes.ObjectId;
  projects: mongooseTypes.ObjectId[];
}
