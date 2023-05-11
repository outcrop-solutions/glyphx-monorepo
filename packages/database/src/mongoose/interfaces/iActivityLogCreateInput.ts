import {database as databaseTypes} from '@glyphx/types';
import {Types as mongooseTypes} from 'mongoose';

export interface IActivityLogCreateInput
  extends Omit<
    databaseTypes.IActivityLog,
    '_id' | 'createdAt' | 'updatedAt' | 'actor' | 'resource'
  > {
  actor: mongooseTypes.ObjectId | databaseTypes.IUser;
  resource:
    | mongooseTypes.ObjectId
    | databaseTypes.IUser
    | databaseTypes.IState
    | databaseTypes.IProject
    | databaseTypes.ICustomerPayment
    | databaseTypes.IMember
    | databaseTypes.IWebhook
    | databaseTypes.IWorkspace;
}
