import type { NextApiRequest, NextApiResponse } from 'next';
import { BasicColumnNameCleaner } from '@glyphx/fileingestion';
import { aws } from '@glyphx/core';
import { S3_BUCKET_NAME } from 'config/constants';
import { PassThrough } from 'stream';

export const config = {
  api: {
    responseLimit: '1024mb',
  },
};
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
    // key = tableName/fileName (dirty)
    // where tableName is just filesName with whitespace trimmed and no file extension
    // i.e 'File Name .csv'
    //     'filename'
    // Extract payload
    const { key, workspaceId, projectId } = req.query;

    if (Array.isArray(key) || Array.isArray(workspaceId) || Array.isArray(projectId)) {
      return res.status(400).end('Bad request. Parameter cannot be an array.');
    }

    const tableName = key.split('/')[0];
    const fileNamWithoutExt = key.split('/')[1].split('.')[0];

    const cleaner = new BasicColumnNameCleaner();
    const cleanTableName = cleaner.cleanColumnName(tableName);
    const cleanFileName = cleaner.cleanColumnName(fileNamWithoutExt);

    const fullKey = `client/${workspaceId}/${projectId}/input/${cleanTableName}/${cleanFileName}.csv`;

    // Add to S3
    const s3Manager = new aws.S3Manager(S3_BUCKET_NAME);
    if (!s3Manager.inited) {
      await s3Manager.init();
    }
    const pStream = new PassThrough();
    const upload = s3Manager.getUploadStream(fullKey, pStream, 'text/csv');
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
