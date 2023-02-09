import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';
import {IWorkspace} from './iWorkspace';
import {INVITATION_STATUS, ROLE} from './constants';

export interface IMember {
  _id?: mongooseTypes.ObjectId;
  email: string;
  inviter: string;
  invitedAt: Date;
  joinedAt: Date;
  deletedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
  status: INVITATION_STATUS;
  teamRole: ROLE;
  member?: IUser;
  invitedBy?: IUser;
  workspace?: IWorkspace;
}
