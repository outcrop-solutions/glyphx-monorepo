import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';

export interface ISession {
  _id: mongooseTypes.ObjectId;
  sessionToken: string;
  userId: mongooseTypes.ObjectId;
  expires: Date;
  user: IUser;
}
