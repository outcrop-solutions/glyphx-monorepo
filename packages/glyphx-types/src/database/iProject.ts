import {Types as mongooseTypes} from 'mongoose';
import {IFileStats} from '../fileIngestion';
import {IOrganization} from './iOrganization';
import {IProjectType} from './iProjectType';
import {IUser} from './iUser';
import {IState} from './iState';

export interface IProject {
  _id: mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  description?: string;
  sdtPath?: string;
  organization?: IOrganization;
  orgId: mongooseTypes.ObjectId;
  slug?: string;
  isTemplate: Boolean;
  type?: IProjectType;
  typeId: mongooseTypes.ObjectId;
  owner?: IUser;
  ownerId: mongooseTypes.ObjectId;
  state?: IState;
  stateId: mongooseTypes.ObjectId;
  files?: IFileStats;
}
