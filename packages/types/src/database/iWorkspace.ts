import {Types as mongooseTypes} from 'mongoose';
import {IProject} from './iProject';
import {IUser} from './iUser';
import {IMember} from './iMember';
import {IState} from './iState';

export interface IWorkspace {
  _id?: mongooseTypes.ObjectId;
  workspaceCode: string;
  inviteCode: string;
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  description?: string;
  creator: IUser;
  members: IMember[];
  projects: IProject[];
  states: IState[];
}
