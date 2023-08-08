import { Types as mongooseTypes } from 'mongoose';
import { IUser } from './iUser';
import { IWorkspace } from './iWorkspace';
import { INVITATION_STATUS, ROLE, MEMBERSHIP_TYPE, PROJECT_ROLE } from '../constants';
import { IProject } from './iProject';

// if project exists, type: PROJECT
export interface IMember {
  _id?: mongooseTypes.ObjectId;
  email: string;
  inviter: string;
  type: MEMBERSHIP_TYPE; // PROJECT ? project present : project: undefined
  invitedAt: Date;
  joinedAt?: Date;
  deletedAt?: Date;
  updatedAt: Date;
  createdAt: Date;
  status: INVITATION_STATUS;
  teamRole?: ROLE;
  projectRole?: PROJECT_ROLE;
  member: IUser;
  invitedBy: IUser;
  workspace: IWorkspace;
  project?: IProject;
}
