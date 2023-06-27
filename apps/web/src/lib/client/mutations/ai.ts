import { web as webTypes } from '@glyphx/types';
import { IClientSidePayload } from '@glyphx/types/src/web';

/**
 * Gets a completion stream from OpenAI
 * @note implements createCompletion
 * @param payload
 */
export const _createCompletion = (payload: IClientSidePayload): webTypes.IFetchConfig => {
  return {
    url: `/api/chat`,
    options: {
      method: 'POST',
      body: { payload },
    },
    successMsg: '',
  };
};
