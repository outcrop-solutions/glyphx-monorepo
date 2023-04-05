import type { NextApiRequest, NextApiResponse } from 'next';
import { aws } from '@glyphx/core';
import { S3_BUCKET_NAME } from 'config/constants';
import { fileIngestion as fileIngestionTypes } from '@glyphx/types';
/**
 * Created signed url to upload files
 *
 * @note signs url via s3Manager
 * @route POST /api/etl/signedUrl
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 *
 */

export const signUploadUrls = async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    workspaceId,
    projectId,
    fileStats,
  }: { workspaceId: string; projectId: string; fileStats: fileIngestionTypes.IFileStats[] } = req.body;
  try {
    // init S3 client
    const s3Manager = new aws.S3Manager(S3_BUCKET_NAME);
    if (!s3Manager.inited) {
      await s3Manager.init();
    }

    const urls = fileStats.map(
      (stat) => `client/${workspaceId}/${projectId}/input/${stat.tableName}/${stat.fileName}.csv`
    );

    // Create an array of promises
    const promises = urls.map((url) => s3Manager.getSignedUploadUrlPromise(url));

    // Use Promise.all to fetch all URLs concurrently
    const signedUrls = await Promise.all(promises);

    res.status(200).json({ data: { signedUrls } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
