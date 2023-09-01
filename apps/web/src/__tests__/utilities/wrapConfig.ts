import { webTypes } from 'types';

// mocks the api fetch configuration
export const wrapConfig = (config: webTypes.IFetchConfig) => {
  const { body, headers, ...opts } = config.options;
  const newConfig = {
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...opts,
  };
  return newConfig;
};
