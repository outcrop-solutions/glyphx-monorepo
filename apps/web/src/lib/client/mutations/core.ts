import {webTypes, databaseTypes} from 'types';
/******************** INGESTION *********************/

/**
 * This is still necessary because we are sending to s3
 * @note could potentially be changed to multi-part upload in api Content-Type
 * @param acceptedFile
 * @param url
 * @returns
 */
export const _uploadFile = (acceptedFile: ArrayBuffer, url: string): webTypes.IFetchConfig => {
  return {
    url: url,
    options: {
      method: 'PUT',
      body: acceptedFile,
    },
    successMsg: 'File successfully uploaded',
  };
};
