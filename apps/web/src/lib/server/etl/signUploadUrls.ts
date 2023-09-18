import type {NextApiRequest, NextApiResponse} from 'next';
import {BasicColumnNameCleaner} from 'fileingestion';
import {s3Connection} from 'business';
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
  const {keys, workspaceId, projectId} = req.body;

  if (Array.isArray(workspaceId) || Array.isArray(projectId)) {
    return res.status(400).end('Bad request. Parameter cannot be an array.');
  }

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

    res.status(200).json({data: {signedUrls}});
  } catch (error) {
    res.status(404).json({errors: {error: {msg: error.message}}});
  }
};
