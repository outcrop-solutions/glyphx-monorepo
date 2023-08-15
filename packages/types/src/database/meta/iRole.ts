import {ROLE} from '../constants';
import {OPERATION} from './operation';

export interface IRole {
  kind: ROLE; // could be changed to a string to allow for arbitrary rbac
  opsAllowed: OPERATION[]; // determines business method accessibility
  rateLimit?: number; //expressed in units of req/second (not currently used)
  usageLimit?: number; // expressed in units of documents/membership (not currently used)
}
