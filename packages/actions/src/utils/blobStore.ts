/* eslint-disable turbo/no-undeclared-env-vars */
/**
 * Gives correct BLOB store based on VERCEL_ENV
 * @returns
 */
export const getToken = () => {
  let token = process.env.DEV_BLOB_READ_WRITE_TOKEN;
  if (process.env.VERCEL_ENV === 'development') {
    token = process.env.DEV_BLOB_READ_WRITE_TOKEN;
  }
  if (process.env.VERCEL_ENV === 'preview') {
    token = process.env.DEMO_BLOB_READ_WRITE_TOKEN;
  }
  if (process.env.VERCEL_ENV === 'production') {
    token = process.env.PROD_BLOB_READ_WRITE_TOKEN;
  }
  return token;
};

/**
 * Formats blob store url based on the environment
 * @param stateId
 * @returns
 */
export const buildStateUrl = (stateId: string) => {
  return `https://${getUrlKey()}.public.blob.vercel-storage.com/state/${stateId}`;
};

export const getUrlKey = () => {
  let urlKey = `${process.env.DEV_BLOB_URL}`;
  if (process.env.VERCEL_ENV === 'preview' && process.env.DEMO_BLOB_URL) {
    urlKey = `${process.env.DEMO_BLOB_URL}`;
  } else if (process.env.VERCEL_ENV === 'production' && process.env.PROD_BLOB_URL) {
    urlKey = `${process.env.PROD_BLOB_URL}`;
  }
  return urlKey;
};
