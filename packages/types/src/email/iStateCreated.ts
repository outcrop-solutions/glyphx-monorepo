import {EmailTypes} from './emailTypes';

export interface iStateCreatedData {
  type: EmailTypes.STATE_CREATED;
  stateName: string;
  stateImage: string; // base64 string
  emails: string[]; // the users that are party to the project / workspace where the state is created
}
