import {IFileStats} from '../../../fileIngestion';
import {IClientSidePayload} from '../../interfaces';

export type RuleWithData<T> = {
  [K in keyof T]: T[K] extends {
    condition: (payload: IClientSidePayload, existingFiles: IFileStats[]) => infer R;
  }
    ? Omit<T[K], 'condition'> & {data: R}
    : T[K];
};
