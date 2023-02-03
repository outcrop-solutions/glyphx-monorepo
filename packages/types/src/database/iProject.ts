import {Types as mongooseTypes} from 'mongoose';
import {IFileStats} from '../fileIngestion';
import {IOrganization} from './iOrganization';
import {IProjectType} from './iProjectType';
import {IUser} from './iUser';
import {IState} from './iState';

export interface IProject {
  _id?: mongooseTypes.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  description?: string;
  sdtPath?: string;
  organization: IOrganization;
  slug?: string;
  isTemplate: Boolean;
  type: IProjectType;
  owner: IUser;
  state?: IState;
  files: IFileStats[];
  viewName: string;
}
