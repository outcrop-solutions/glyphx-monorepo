// THIS CODE WAS AUTOMATICALLY GENERATED
import {databaseTypes} from 'types';
import {Types as mongooseTypes} from 'mongoose';

export interface IMemberDocument
  extends Omit<
    databaseTypes.IMember,
    'member' | 'invitedBy' | 'workspace' | 'project'
  > {
  member: mongooseTypes.ObjectId;
  invitedBy: mongooseTypes.ObjectId;
  workspace: mongooseTypes.ObjectId;
  project: mongooseTypes.ObjectId;
}
