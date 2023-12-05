// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IActivityLogDocument
  extends Omit<databaseTypes.IActivityLog, 'actor' | 'workspace' | 'project' | 'userAgent'> {
  actor: mongooseTypes.ObjectId;
  workspace: mongooseTypes.ObjectId;
  project: mongooseTypes.ObjectId;
  userAgent: mongooseTypes.ObjectId;
}
