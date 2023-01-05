import { database as databaseTypes } from '@glyphx/types';

export interface IUserMethods {
  updateUser(input: databaseTypes.IUser): Promise<any>;
}
