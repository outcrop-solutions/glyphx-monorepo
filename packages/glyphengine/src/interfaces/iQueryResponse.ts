import {QUERY_STATUS} from '../constants';

export interface IQueryResponse {
  status: QUERY_STATUS;
  error?: string;
}
