import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';

export interface IWebhook {
  _id?: mongooseTypes.ObjectId;
  id?: string;
  createdAt: Date;
  updatedAt: Date;
  name: string;
  url: string;
  user: IUser;
}
