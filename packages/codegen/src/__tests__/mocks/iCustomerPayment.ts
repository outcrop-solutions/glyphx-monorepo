import {Types as mongooseTypes} from 'mongoose';
import {IUser} from './iUser';
import {SUBSCRIPTION_TYPE} from '../constants';

export interface ICustomerPayment {
  _id?: mongooseTypes.ObjectId;
  paymentId: string;
  email?: string;
  subscriptionType: SUBSCRIPTION_TYPE;
  createdAt: Date;
  deletedAt?: Date;
  updatedAt: Date;
  customer: IUser;
}
