import type { NextApiRequest, NextApiResponse } from 'next';
// import { aws } from '@glyphx/core';

// import { S3_BUCKET_NAME } from 'constants/config';
import { FIELD_TYPE, FILE_OPERATION } from '@glyphx/types/src/fileIngestion/constants';

// call constructor, .init() && .process() on class instantiation, pipe return value to resonse object
export const handleIngestion = async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
  const { orgId, projectId } = req.query;
  // const { fileStats, fileInfo } = req.body;

  // if (Array.isArray(projectId) || Array.isArray(orgId))
  //   return res.status(400).end('Bad request. projectId or orgId parameters cannot be arrays.');

  // // const s3Client = new aws.S3Manager(`${S3_BUCKET_NAME}`);
  // const s3Client = new aws.S3Manager(`sampleproject191427-prod
  //   `);
  // await s3Client.init();
  // const objects = await s3Client.listObjects('');
  // // const file = await s3Client.getFileInformation(objects[0]);
  // // fileInfo.forEach((op) => {
  // //   const stream = await s3Client.getObjectStream(op.table);
  // // })
  // const fileStats = {
  //   fileName: name,
  //   tableName: name.split('.')[0],
  //   numberOfRows: 100,
  //   numberOfColumns: 4,
  //   columns: [
  //     { name: 'col1', fieldType: FIELD_TYPE.NUMBER, longestString: undefined },
  //     { name: 'col2', fieldType: FIELD_TYPE.STRING, longestString: 2 },
  //     { name: 'col3', fieldType: FIELD_TYPE.STRING, longestString: 13 },
  //     { name: 'col4', fieldType: FIELD_TYPE.NUMBER, longestString: undefined },
  //   ],
  //   fileSize: size,
  // };

  // const fileInfo = {
  //   fileName: name,
  //   tableName: name.split('.')[0],
  //   operation: FILE_OPERATION.ADD,
  //   fileStream: stream,
  // };
  // const payload = {
  //   clientId: 'orgId_123456',
  //   modelId: `modelId_${projectId}`,
  //   bucketName: `${S3_BUCKET_NAME}`,
  //   fileStats: [fileStats],
  //   fileInfo: [fileInfo],
  // };

  // const ingestor = new FileIngestor(payload as IPayload, 'jpstestdatabase');
  // await ingestor.init();

  // const result = await ingestor.process();
  // console.log({ type: fieldCalculator.fieldType });
  // return res.status(200).json({ fieldCalculator });
  return res.status(200).json({ ok: true });
};

const RESOURCE_URL =
  'https://gist.githubusercontent.com/okbel/8ba642143f6912548df2d79f2c0ebabe/raw/4bcf9dc5750b42fa225cf6571d6aaa68c23a73aa/README.md';

// export const config = {
//   runtime: 'experimental-edge',
// };

export const streamS3 = async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
  const { orgId, projectId } = req.query;

  if (Array.isArray(projectId) || Array.isArray(orgId))
    return res.status(400).end('Bad request. projectId or orgId parameters cannot be arrays.');

  // if (!Array.isArray(fileStats) || !Array.isArray(fileInfo))
  //   return res.status(400).end('Bad request. fileStats && fileInfo parameters must be arrays.');

  // const data = await Storage.list(`client/${orgId}/${projectId}/input/`);
  // const s3Client = new aws.S3Manager(`${S3_BUCKET_NAME}`);
  // await s3Client.init();
  // const objects = await s3Client.listObjects('bigtable');
  // console.log({ objects });
  // // TODO: Get S3 location from Dynamo table using projectId
  // // Use the location as the RESOURCE_URL below to stream a set of files  for a given project.
  // const fileInfo = await s3Client.getFileInformation(objects[1]);
  // console.log({ fileInfo });
  // const stream = await s3Client.getObjectStream(fileInfo.fileName);
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

