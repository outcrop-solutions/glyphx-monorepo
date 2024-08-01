import {S3Manager} from 'core/src/aws';

export const signUrls = async (workspaceId: string, projectId: string, payloadHash: string, s3: S3Manager) => {
  const urls = [
    `client/${workspaceId}/${projectId}/output/${payloadHash}.sdt`,
    `client/${workspaceId}/${projectId}/output/${payloadHash}.sgn`,
    `client/${workspaceId}/${projectId}/output/${payloadHash}.sgc`,
  ];

  // Create an array of promises
  const promises = urls.map((url) => s3.getSignedDataUrlPromise(url));
  // Use Promise.all to fetch all URLs concurrently
  const signedUrls = await Promise.all(promises);
  const sdtUrl = signedUrls.find((u: string) => u.includes('.sdt'));
  const sgcUrl = signedUrls.find((u: string) => u.includes('.sgc'));
  const sgnUrl = signedUrls.find((u: string) => u.includes('.sgn'));

  return {sdtUrl, sgcUrl, sgnUrl};
};
