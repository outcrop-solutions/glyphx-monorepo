import type { NextApiRequest, NextApiResponse } from 'next';
import { FileIngestor } from '@glyphx/fileingestion';
import { aws } from '@glyphx/core';

import { IPayload } from '@glyphx/types/src/fileIngestion';
import { FieldType, IngestionType, ProcessInput } from './types';
import { fileIngestion } from '@glyphx/types';
import { S3_BUCKET_NAME } from 'constants/config';
import { FIELD_TYPE, FILE_OPERATION } from '@glyphx/types/src/fileIngestion/constants';

export const handleIngestion = async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
  const s3Client = new aws.S3Manager(`${S3_BUCKET_NAME}`);
  console.log({ s3Client });
  await s3Client.init();
  const objects = await s3Client.listObjects('table1/Table1.csv');
  console.log({ objects });
  // TODO: Get S3 location from Dynamo table using projectId
  // Use the location as the RESOURCE_URL below to stream a set of files  for a given project.
  const file = await s3Client.getFileInformation(objects[0]);
  console.log({ file });
  const stream = await s3Client.getObjectStream(file.fileName);
  console.log({ stream });
  const fileStats = {
    fileName: 'testing.csv',
    tableName: 'testing',
    numberOfRows: 100,
    numberOfColumns: 4,
    columns: [
      { name: 'col1', fieldType: FIELD_TYPE.NUMBER, longestString: undefined },
      { name: 'col2', fieldType: FIELD_TYPE.STRING, longestString: 2 },
      { name: 'col3', fieldType: FIELD_TYPE.STRING, longestString: 13 },
      { name: 'col4', fieldType: FIELD_TYPE.NUMBER, longestString: undefined },
    ],
    fileSize: file.fileSize,
  };

  const fileInfo = {
    fileName: 'testing.csv',
    tableName: 'testing',
    operation: FILE_OPERATION.ADD,
    fileStream: stream,
  };
  const payload = {
    clientId: 'clientIdTest',
    modelId: 'modelIdTest',
    bucketName: `${S3_BUCKET_NAME}`,
    fileStats: [fileStats],
    fileInfo: [fileInfo],
  };

  const ingestor = new FileIngestor(payload as IPayload, 'jpstestdatabase');
  await ingestor.init();

  const result = await ingestor.process();
  console.log({ result });
  return res.status(200).json({ result });
  // return res.status(200).json({ ok: true });
};

const RESOURCE_URL =
  'https://gist.githubusercontent.com/okbel/8ba642143f6912548df2d79f2c0ebabe/raw/4bcf9dc5750b42fa225cf6571d6aaa68c23a73aa/README.md';

// export const config = {
//   runtime: 'experimental-edge',
// };

export const streamS3 = async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
  const { orgId, projectId } = req.query;
  const s3Client = new aws.S3Manager(`${S3_BUCKET_NAME}`);
  await s3Client.init();
  const objects = await s3Client.listObjects('bigtable');
  console.log({ objects });
  // TODO: Get S3 location from Dynamo table using projectId
  // Use the location as the RESOURCE_URL below to stream a set of files  for a given project.
  const fileInfo = await s3Client.getFileInformation(objects[1]);
  console.log({ fileInfo });
  // const stream = await s3Client.getObjectStream(fileInfo.fileName);
  // console.log({ stream });

  // compute file statistics
  // compute data grid

  // The decoder will be used to decode the bytes in the stream returned by fetching
  // the external resource to UTF-8 (the default).
  // https://developer.mozilla.org/en-US/docs/Web/API/TextDecode
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

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

/**
 * Takes acceptedFiles from Client input and turns a renderable grid
 *
 * Fetches & returns either a single or all files available depending on
 * whether a `fileId` query parameter is provided. If not all files are
 * returned in descending order.
 *
 * @param type
 * @returns Grid
 */
export async function processFiles(input: ProcessInput) {
  convert2state(input);
}

const convert2state = async (input) => {
  if (input.ingestionType == 'BROWSER') {
    browser2state(input.files);
  } else if (input.ingestionType == 'S3') {
    s32state(input.files);
  }
};

// TAKES ARRAY OF FILE BLOBS, RETURNS READABLE STREAM OF APP STATE
const browser2state = (files: Blob[]) => {};

// TAKES S3 LOCATION, STREAMS RENDERABLE APP STATE IN JSON FORMAT
const s32state = (files: string) => {};
