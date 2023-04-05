import type { NextApiRequest, NextApiResponse } from 'next';
// import { Session } from 'next-auth';
import { aws } from '@glyphx/core';
import { S3_BUCKET_NAME } from 'config/constants';
import { PassThrough } from 'stream';

/**
 * Upload Files
 *
 * @note Process a file set to a table
 *
 * @route POST /api/etl/upload
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 * @param session - NextAuth.js session
 *
 */

export const uploadFile = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    // Extract payload
    const { key } = req.headers;
    if (Array.isArray(key)) {
      return res.status(400).end('Bad request. Parameter cannot be an array.');
    }

    // Add to S3
    const s3Manager = new aws.S3Manager(S3_BUCKET_NAME);
    if (!s3Manager.inited) {
      await s3Manager.init();
    }
    const pStream = new PassThrough();
    const upload = s3Manager.getUploadStream(key, pStream, 'text/csv');
    req.pipe(pStream);

    await upload.done();

    // return file information & processID
    res.status(200).json({
      data: true,
    });
    // res.status(200).json({ ok: true });
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
