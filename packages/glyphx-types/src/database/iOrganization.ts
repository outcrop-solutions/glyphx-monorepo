import {Types as mongooseTypes} from 'mongoose';
import {IProject} from './iProject';
import {IUser} from './iUser';

export interface IOrganization {
  _id: mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  name: String;
  description?: string;
  owner?: IUser;
  ownerId: mongooseTypes.ObjectId;
  members?: IUser[];
  projects?: IProject[];
}
