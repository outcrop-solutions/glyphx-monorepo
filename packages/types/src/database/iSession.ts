import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';

export interface ISession {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  userId?: string;
  sessionToken: string;
  expires: Date;
  user: IUser;
}
