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

export const signUrl = async (req: NextApiRequest, res: NextApiResponse) => {
  const { payload } = req.body;
  try {
    // Add to S3
    const s3Manager = new aws.S3Manager(S3_BUCKET_NAME);
    if (!s3Manager.inited) {
      await s3Manager.init();
    }

    const url = 'https://s3.com';
    res.status(200).json({ data: { url } });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
