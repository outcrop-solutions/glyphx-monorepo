import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';
import {IWorkspace} from './iWorkspace';
import {INVITATION_STATUS, ROLE, MEMBERSHIP_TYPE} from './constants';
import {IProject} from './iProject';

export interface IMember {
  _id?: mongooseTypes.ObjectId;
  email: string;
  inviter: string;
  type: MEMBERSHIP_TYPE;
  invitedAt: Date;
  joinedAt?: Date;
  deletedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
  status: INVITATION_STATUS;
  teamRole: ROLE;
  member: IUser;
  invitedBy: IUser;
  workspace?: IWorkspace;
  project?: IProject;
}
