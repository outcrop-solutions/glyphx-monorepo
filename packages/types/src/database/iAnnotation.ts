import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';

export interface IAnnotation {
  _id?: string | mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  author: IUser;
  value: string;
  projectId?: string | mongooseTypes.ObjectId;
  stateId?: string | mongooseTypes.ObjectId;
}
