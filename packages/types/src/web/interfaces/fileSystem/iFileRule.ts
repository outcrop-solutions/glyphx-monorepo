import {IClientSidePayload} from './iClientSidePayload';

export interface IFileRule {
  name: string;
  desc: string;
  condition?: (payload: IClientSidePayload) => Record<string, any> | false; // should return relevant data to be displayed in modal
  data?: Record<string, unknown>;
}
