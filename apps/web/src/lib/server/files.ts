import type { NextApiRequest, NextApiResponse } from 'next';
import { aws } from '@glyphx/core';
import { S3_BUCKET_NAME } from 'config/constants';
// import { S3_BUCKET_NAME } from 'config/constants';

export const streamS3 = async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
  const { orgId, projectId } = req.query;

  if (Array.isArray(projectId) || Array.isArray(orgId))
    return res.status(400).end('Bad request. projectId or orgId parameters cannot be arrays.');

  const s3Client = new aws.S3Manager(`${S3_BUCKET_NAME}`);

  if (!s3Client.inited) {
    await s3Client.init();
  }

  const objects = await s3Client.listObjects('');
  const fileInfo = await s3Client.getFileInformation(objects[1]);
  const stream = await s3Client.getObjectStream(fileInfo.fileName);

  console.log({ objects });
  // console.log({ fileInfo });
  // console.log({ stream });

  // compute file statistics
  // compute data grid

  // The decoder will be used to decode the bytes in the stream returned by fetching
  // the external resource to UTF-8 (the default).
  // https://developer.mozilla.org/en-US/docs/Web/API/TextDecode
  // const encoder = new TextEncoder();
  // const decoder = new TextDecoder();

  return res.status(200).json({ ok: true });
  // Pipe the stream to a transform stream that will take its chunks and transform
  // them into uppercase text.
  // https://developer.mozilla.org/en-US/docs/Web/API/TransformStream/TransformStream
  // const transformedResponse = res.body?.pipeThrough(
  //   new TransformStream({
  //     start(controller) {
  //       controller.enqueue(
  //         encoder.encode(`<html><head><title>Vercel Edge Functions + Streams + Transforms</title></head><body>`)
  //       );
  //       controller.enqueue(encoder.encode(`Resource: ${RESOURCE_URL}<br/>`));
  //       controller.enqueue(encoder.encode(`<hr/><br/><br/><br/>`));
  //     },
  //     transform(chunk, controller) {
  //       controller.enqueue(encoder.encode(decoder.decode(chunk, { stream: true }).toUpperCase().concat(' <---')));
  //     },
  //     flush(controller) {
  //       controller.enqueue(encoder.encode('</body></html>'));
  //     },
  //   })
  // );

  // return new Response(transformedResponse, {
  //   headers: { 'Content-Type': 'text/html; charset=utf-8' },
  // });
};
