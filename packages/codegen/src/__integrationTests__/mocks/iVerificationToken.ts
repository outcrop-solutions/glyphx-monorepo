import {Types as mongooseTypes} from 'mongoose';

export interface IVerificationToken {
  _id?: mongooseTypes.ObjectId;
  identifier: string;
  token: string;
  expires: Date;
}
