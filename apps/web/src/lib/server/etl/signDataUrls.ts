import type { NextApiRequest, NextApiResponse } from 'next';
import { aws } from '@glyphx/core';
import { S3_BUCKET_NAME } from 'config/constants';
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
  const { workspaceId, projectId, fileHash } = req.body;
  try {
    // init S3 client
    const s3Manager = new aws.S3Manager(S3_BUCKET_NAME);
    if (!s3Manager.inited) {
      await s3Manager.init();
    }
    const urls = [
      `client/${workspaceId}/${projectId}/output/${fileHash}.sdt`,
      `client/${workspaceId}/${projectId}/output/${fileHash}.sgn`,
      `client/${workspaceId}/${projectId}/output/${fileHash}.sgc`,
    ];

    // Create an array of promises
    const promises = urls.map((url) => s3Manager.getSignedDataUrlPromise(url));

    // Use Promise.all to fetch all URLs concurrently
    const signedUrls = await Promise.all(promises);
    const sdtUrl = signedUrls.find((u: string) => u.includes('.sdt'));
    const sgcUrl = signedUrls.find((u: string) => u.includes('.sgc'));
    const sgnUrl = signedUrls.find((u: string) => u.includes('.sgn'));

    res.status(200).json({ data: { sdtUrl, sgcUrl, sgnUrl } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
