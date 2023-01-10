import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IProjectDocument
  extends Omit<
    databaseTypes.IProject,
    '_id' | 'organization' | 'type' | 'owner' | 'state'
  > {
  organization: mongooseTypes.ObjectId;
  type: mongooseTypes.ObjectId;
  owner: mongooseTypes.ObjectId;
  state?: mongooseTypes.ObjectId;
}
