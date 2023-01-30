import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';

export interface ISession {
  _id?: mongooseTypes.ObjectId;
  sessionToken: string;
  expires: Date;
  user: IUser;
}
