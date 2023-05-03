import { parse } from 'papaparse';
import { S3_BUCKET_NAME } from 'config/constants';
import { Types as mongooseTypes } from 'mongoose';
import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';

// @jp-burford added in here because the class this lives in can't be imported on the client
const REPLACEABLE_CHARS = [
  32, //space
  40, //(
  41, //)
  45, //-
  // 65-90, //A-Z
  // 97-122, //a-z
];

export const cleanColumnName = (value: string): string => {
  const outArray: string[] = [];
  const tempValue = value.toLowerCase();
  for (let i = 0; i < tempValue.length; i++) {
    const charValue = tempValue.charCodeAt(i);
    if (i === 0 && !((charValue >= 65 && charValue <= 90) || (charValue >= 97 && charValue <= 122))) {
      outArray.push('_');
    } else if (i !== 0 && REPLACEABLE_CHARS.find((c) => c === charValue)) {
      outArray.push('_');
    } else if (
      charValue === 95 || //_
      (charValue >= 48 && charValue <= 57) || //0-9
      (charValue >= 97 && charValue <= 122) //a-z
    ) {
      outArray.push(String.fromCharCode(charValue));
    }
  }

  const ret = outArray.join('');

  const result = ret.split('').reduce((acc, curr) => {
    if (acc === '' && curr === '_') {
      return acc;
    }
    return acc + curr;
  }, '');

  return result;
};

/**
 * Takes in an array of file Blobs and returns the fileIngestionTypes.IFileStats
 * @param {File[]}
 * @returns {fileIngestionTypes.IPayload}
 */

export const parsePayload = async (
  workspaceId: string | mongooseTypes.ObjectId,
  projectId: string | mongooseTypes.ObjectId,
  acceptedFiles: File[]
): Promise<webTypes.IClientSidePayload> => {
  const stats = await Promise.all(
    acceptedFiles.map(async (file: File): Promise<fileIngestionTypes.IFileStats> => {
      const text = await file.text();
      const { data } = parse(text, { preview: 10 });
      return {
        fileName: `${cleanColumnName(file.name.split('.')[0])}.csv`,
        tableName: cleanColumnName(file.name.split('.')[0]),
        numberOfRows: data?.length,
        numberOfColumns: Object.keys(data[0])?.length,
        columns: data[0].map((item, idx) => ({
          name: item,
          fieldType: isNaN(Number(data[1][idx]))
            ? fileIngestionTypes.constants.FIELD_TYPE.STRING
            : fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
          longestString: undefined,
        })),
        fileSize: file.size,
      };
    })
  );

  const operations = acceptedFiles.map((file: File): Omit<fileIngestionTypes.IFileInfo, 'fileStream'> => {
    return {
      fileName: `${cleanColumnName(file.name.split('.')[0])}.csv`,
      tableName: cleanColumnName(file.name.split('.')[0]),
      operation: 2,
    };
  });

  const payload = {
    clientId: workspaceId.toString(),
    modelId: projectId.toString(),
    bucketName: S3_BUCKET_NAME,
    fileStats: stats,
    fileInfo: operations,
  };

  return payload;
};
