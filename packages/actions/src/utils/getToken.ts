/* eslint-disable turbo/no-undeclared-env-vars */
/**
 * Gives correct BLOB store based on VERCEL_ENV
 * @returns
 */
export const getToken = () => {
  if (process.env.VERCEL_ENV === 'development') {
    return process.env.DEV_BLOB_READ_WRITE_TOKEN;
  }
  if (process.env.VERCEL_ENV === 'preview') {
    return process.env.DEMO_BLOB_READ_WRITE_TOKEN;
  }
  if (process.env.VERCEL_ENV === 'production') {
    return process.env.PROD_BLOB_READ_WRITE_TOKEN;
  }
};
