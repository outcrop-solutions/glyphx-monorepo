/* eslint-disable turbo/no-undeclared-env-vars */
/**
 * Gives correct BLOB store based on VERCEL_ENV
 * @returns
 */
export const getToken = () => {
  if (process.env.GLYPHX_ENV === 'dev') {
    return process.env.DEV_BLOB_READ_WRITE_TOKEN;
  }
  if (process.env.GLYPHX_ENV === 'demo') {
    return process.env.DEMO_BLOB_READ_WRITE_TOKEN;
  }
  if (process.env.GLYPHX_ENV === 'prod') {
    return process.env.PROD_BLOB_READ_WRITE_TOKEN;
  }
};

export const getUrlKey = () => {
  let urlKey;
  if (process.env.GLYPHX_ENV === 'dev') {
    urlKey = `${process.env.DEV_BLOB_URL}`;
  }
  if (process.env.GLYPHX_ENV === 'demo') {
    urlKey = `${process.env.DEMO_BLOB_URL}`;
  }
  if (process.env.GLYPHX_ENV === 'prod') {
    urlKey = `${process.env.PROD_BLOB_URL}`;
  }
  return urlKey;
};

/**
 * Formats blob store url based on the environment
 * @param stateId
 * @returns
 */
export const buildStateUrl = (stateId: string) => {
  return `https://${getUrlKey()}.public.blob.vercel-storage.com/state/${stateId}`;
};
