// Hard coded constants for use in file ingestion process
export const S3_BUCKET_NAME = 'jps-test-bucket';
export const ATHENA_DB_NAME = 'jpstestdatabase';

/**
 * Returns base url based on environment
 * @returns {string}
 */
export const getUrl = () => {
  switch (process.env.API_ENV) {
    case 'development':
      return 'http://localhost:3000';
    case 'production':
      return 'https://app.glyphx.co';
    default:
      return 'http://localhost:3000';
  }
};
