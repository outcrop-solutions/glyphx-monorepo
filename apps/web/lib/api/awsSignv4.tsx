import type { NextApiRequest, NextApiResponse } from 'next';
import type { Session } from 'next-auth';
import { hmac, hmacStepwise, createHmac, hexhmac } from '../cryptoHelpers';

/**
 * Create signed URL for S3 transfer
 *
 * Fetches & returns either a single or all files available depending on
 * whether a `fileId` query parameter is provided. If not all files are
 * returned in descending order.
 *
 * @param req - Next.js API Request
 * @param res - Next.js API Response
 */
export async function awsSignv4(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session
): Promise<void | NextApiResponse> {
  // @ts-ignore
  if (!session.user.id) return res.status(500).end('Server failed to get session user ID');

  try {
    const timestamp = Date.now().toString().substring(0, 8);

    console.log({ timestamp });
    const dateKey = hmac('AWS4' + process.env.AWS_SECRET, timestamp);
    console.log({ dateKey });
    const dateRegionKey = hmac(dateKey, process.env.AWS_REGION);
    console.log({ dateRegionKey });
    const dateRegionServiceKey = hmac(dateRegionKey, 's3');
    console.log({ dateRegionServiceKey });
    const signingKey = hmac(dateRegionServiceKey, 'aws4_request');

    var signature = hmac(signingKey, req.query.to_sign).toString('hex');

    console.log('Created signature "' + signature + '" from ' + req.query.to_sign);
    res.send(signature);

    return res.status(200).json({ signature });
  } catch (error) {
    console.error(error);
    return res.status(500).end(error);
  }
}


