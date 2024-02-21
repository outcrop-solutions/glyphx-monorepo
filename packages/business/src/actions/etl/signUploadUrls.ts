'use server';
import {error, constants} from 'core';
import {BasicColumnNameCleaner} from 'fileingestion';
import {s3Connection} from '../../lib';

/**
 * Created signed url to upload files
 * @param keys
 * @param workspaceId
 * @param projectId
 * @returns
 */
export const signUploadUrls = async (keys, workspaceId, projectId) => {
  try {
    const urls = (keys as string[]).map((key) => {
      const tableName = key.split('/')[0];
      const fileNamWithoutExt = key.split('/')[1].split('.')[0];

      const cleaner = new BasicColumnNameCleaner();
      const cleanTableName = cleaner.cleanColumnName(tableName);
      const cleanFileName = cleaner.cleanColumnName(fileNamWithoutExt);

      return `client/${workspaceId}/${projectId}/input/${cleanTableName}/${cleanFileName}.csv`;
    });

    // Add to S3
    const s3Manager = s3Connection.s3Manager;
    // Create an array of promises
    const promises = urls.map((url) => s3Manager.getSignedUploadUrlPromise(url));

    // Use Promise.all to fetch all URLs concurrently
    const signedUrls = await Promise.all(promises);

    return {signedUrls};
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred running sign upload urls',
      'etl',
      {keys, workspaceId, projectId},
      err
    );
    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};
