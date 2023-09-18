import type {NextApiRequest, NextApiResponse} from 'next';
import {aws} from 'core';
import {S3_BUCKET_NAME} from 'config/constants';
import * as business from 'business';
/**
 * Created signed url to upload files
 *
 * @note signs url via s3Manager
 * @route POST /api/etl/signedUrl
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 *
 */

export const signDataUrls = async (req: NextApiRequest, res: NextApiResponse) => {
  const {workspaceId, projectId, payloadHash} = req.body;
  try {
    // init S3 client
    const s3Manager = business.s3Connection.s3Manager;
    const urls = [
      `client/${workspaceId}/${projectId}/output/${payloadHash}.sdt`,
      `client/${workspaceId}/${projectId}/output/${payloadHash}.sgn`,
      `client/${workspaceId}/${projectId}/output/${payloadHash}.sgc`,
    ];

    // Create an array of promises
    const promises = urls.map((url) => s3Manager.getSignedDataUrlPromise(url));

    // Use Promise.all to fetch all URLs concurrently
    const signedUrls = await Promise.all(promises);
    const sdtUrl = signedUrls.find((u: string) => u.includes('.sdt'));
    const sgcUrl = signedUrls.find((u: string) => u.includes('.sgc'));
    const sgnUrl = signedUrls.find((u: string) => u.includes('.sgn'));

    res.status(200).json({data: {sdtUrl, sgcUrl, sgnUrl}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
