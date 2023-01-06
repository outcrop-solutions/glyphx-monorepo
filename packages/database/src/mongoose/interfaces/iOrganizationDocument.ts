import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IOrganizationDocument
  extends Omit<databaseTypes.IOrganization, 'projects' | 'members' | 'owner'> {
  projects: mongooseTypes.ObjectId[];
  members: mongooseTypes.ObjectId[];
  owner: mongooseTypes.ObjectId;
}
