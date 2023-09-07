import {webTypes} from 'types';
import {IClientSidePayload} from 'types/src/web';

/**
 * Gets a completion stream from OpenAI
 * @note implements createCompletion
 * @param payload
 */
export const _createCompletion = (payload: IClientSidePayload): webTypes.IFetchConfig => {
  return {
    url: `/api/completion`,
    options: {
      method: 'POST',
      body: {payload},
    },
    successMsg: '',
  };
};
