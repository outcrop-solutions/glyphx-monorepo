import {EmailTypes} from './emailTypes';

export interface iEmailUpdatedData {
  type: EmailTypes.EMAIL_UPDATED;
  oldEmail: string;
  newEmail: string;
}
