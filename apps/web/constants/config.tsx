export const S3_BUCKET_NAME = 'jps-test-bucket';
export const ATHENA_DB_NAME = 'jpstestdatabase';

export const getUrl = () => {
  console.log({ nodeEnv: `${process.env.API_ENV}` });
  switch (process.env.API_ENV) {
    case 'development':
      return 'http://localhost:3000';
    case 'production':
      return 'https://app.glyphx.co';
    default:
      break;
  }
};
