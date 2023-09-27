import {databaseTypes} from 'types';

export interface IActivityLogCreateInput
  extends Omit<databaseTypes.IActivityLog, '_id' | 'createdAt' | 'updatedAt' | 'actor' | 'resource'> {
  actor: string | databaseTypes.IUser;
  resource:
    | string
    | databaseTypes.IUser
    | databaseTypes.IState
    | databaseTypes.IProject
    | databaseTypes.ICustomerPayment
    | databaseTypes.IMember
    | databaseTypes.IWebhook
    | databaseTypes.IProcessTracking
    | databaseTypes.IWorkspace;
}
