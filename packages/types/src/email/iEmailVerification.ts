import {EmailTypes} from './emailTypes';

/**
 * Comes from nextAuth params
 */
export interface iEmailVerificationData {
  type: EmailTypes.EMAIL_VERFICATION;
  identifier: string;
  url: string;
  provider: {
    from: string;
  };
  theme: any;
}
