'use server';
import {error, constants} from 'core';
import {s3Connection} from '../../../business/src/lib';

/**
 * Created signed url to upload files
 * @param workspaceId
 * @param projectId
 * @param payloadHash
 * @returns
 */
export const signDataUrls = async (workspaceId: string, projectId: string, payloadHash: string) => {
  try {
    // init S3 client
    const s3Manager = s3Connection.s3Manager;
    await s3Manager.init();
    const urls = [
      `client/${workspaceId}/${projectId}/output/${payloadHash}.sdt`,
      `client/${workspaceId}/${projectId}/output/${payloadHash}.sgn`,
      `client/${workspaceId}/${projectId}/output/${payloadHash}.sgc`,
    ];
    // Create an array of promises
    const promises = urls.map((url) => s3Manager.getSignedDataUrlPromise(url));
    // Use Promise.all to fetch all URLs concurrently
    const signedUrls = await Promise.all(promises);
    console.log({signedUrls});
    const sdtUrl = signedUrls.find((u: string) => u.includes('.sdt'));
    const sgcUrl = signedUrls.find((u: string) => u.includes('.sgc'));
    const sgnUrl = signedUrls.find((u: string) => u.includes('.sgn'));

    return {sdtUrl, sgcUrl, sgnUrl};
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred runningsign data urls',
      'etl',
      {workspaceId, projectId, payloadHash},
      err
    );
    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};
