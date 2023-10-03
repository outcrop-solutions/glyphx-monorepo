import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';
import {IState} from './iState';

export interface IComment {
  _id: string | mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  content: string;
  author: IUser;
  state: IState;
}
