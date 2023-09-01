import {databaseTypes} from 'types';

//this is done this way to support or structure.  token is just amitted and readded so that ts and eslint do not complain
export interface IVerificationTokenDocument
  extends Omit<databaseTypes.IVerificationToken, 'token'> {
  token: string;
}
