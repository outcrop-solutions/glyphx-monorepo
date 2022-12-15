import { FieldType, IngestionType, ProcessInput } from './types';
import { fileIngestion } from '@glyphx/types';
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

import { HttpMethod } from 'types';

import type { NextApiRequest, NextApiResponse } from 'next';
import { FileIngestor } from '@glyphx/fileingestion';
import { IPayload } from '@glyphx/types/src/fileIngestion';

export const handleIngestion = async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
  const fileStats = {
    fileName: 'table1.csv',
    tableName: 'table1',
    numberOfRows: 100,
    numberOfColumns: 10,
    columns: [{ name: 'Column1', fieldType: '', longestString: 13 }],
    fileSize: 2348,
  };

  const fileInfo = {
    tableName: 'table1',
    fielName: 'table1.csv',
    operation: 'ADD',
    fielStream: {},
  };
  const payload = {
    clientId: '',
    modelId: '',
    bucketName: 'jpstestdatabase',
    fileStats: [fileStats],
    fileInfo: [fileInfo],
  };

  // @ts-ignore
  const ingestor = new FileIngestor(payload, 'jpstestdatabase');
  await ingestor.init();
  const result = ingestor.process();
  return res.status(200).json(result);
};
