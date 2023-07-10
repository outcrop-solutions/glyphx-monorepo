import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';

export interface ISession {
  _id?: mongooseTypes.ObjectId;
  userId?: string;
  sessionToken: string;
  expires: Date;
  user: IUser;
}
