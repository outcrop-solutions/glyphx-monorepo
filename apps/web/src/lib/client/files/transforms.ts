import MD5 from 'crypto-js/md5';
import { parse } from 'papaparse';
import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { S3_BUCKET_NAME } from 'config/constants';
import { Types as mongooseTypes } from 'mongoose';

/**
 * Takes in papaparsed file data and returns the rendarable grid state
 * @param {File}
 * @returns {webTypes.RenderableDataGrid}
 */
export const formatGridData = (data): webTypes.IRenderableDataGrid => {
  const colNames = Object.keys(data[0]);

  let cols = colNames.map((item, idx) => {
    return {
      key: item,
      name: item === 'glyphx_id__' ? 'id' : item,
      dataType: isNaN(Number(data[0][item]))
        ? fileIngestionTypes.constants.FIELD_TYPE.STRING
        : fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
      width: 120,
      dragable: true,
      resizable: false,
      sortable: false,
    };
  });
  // Generates first column
  const rows = data.map((row, idx) => ({
    ...row,
    id: idx,
  }));
  return { columns: cols, rows };
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
        fileName: file.name,
        tableName: file.name.split('.')[0].trim().toLowerCase(),
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
      fileName: file.name,
      tableName: file.name.split('.')[0].trim().toLowerCase(),
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

// Immutable pre-upload file rules
const FILE_RULES: webTypes.IFileRule[] = [
  {
    name: 'Duplicate column names',
    desc: 'Your csv has duplicate column names which is not allowed in model generation. Please de-duplicate the following columns and re-upload your file:',
    condition: (
      payload
    ):
      | {
          intraFileDuplicates?: { file: string; column: string }[];
          interFileDuplicates?: { name: string; types: { fileType: number; fileName: string }[] }[];
        }
      | false => {
      const intraFileDuplicates: { file: string; column: string }[] = [];
      const interFileDuplicates: { name: string; types: { fileType: number; fileName: string }[] }[] = [];
      const nameTypes = new Map<string, Map<number, string[]>>();

      for (const fileStat of payload.fileStats) {
        const fileColumnNames = new Set<string>();

        for (const column of fileStat.columns) {
          const columnName = column.name;
          const columnType = column.fieldType;

          if (fileColumnNames.has(columnName)) {
            intraFileDuplicates.push({ file: fileStat.fileName, column: columnName });
          } else {
            fileColumnNames.add(columnName);
          }

          if (nameTypes.has(columnName)) {
            const types = nameTypes.get(columnName);
            if (types.has(columnType)) {
              types.get(columnType)?.push(fileStat.fileName);
              continue;
            }
            types.set(columnType, [fileStat.fileName]);
            const typeArr = Array.from(types.entries()).map(([fileType, fileNames]) => ({
              fileType,
              fileName: fileNames[0],
            }));
            interFileDuplicates.push({ name: columnName, types: typeArr });
          } else {
            nameTypes.set(columnName, new Map<number, string[]>([[columnType, [fileStat.fileName]]]));
          }
        }
      }

      const result: {
        intraFileDuplicates?: { file: string; column: string }[];
        interFileDuplicates?: { name: string; types: { fileType: number; fileName: string }[] }[];
      } = {};
      if (intraFileDuplicates.length > 0) {
        result.intraFileDuplicates = intraFileDuplicates;
      }
      if (interFileDuplicates.length > 0) {
        result.interFileDuplicates = interFileDuplicates;
      }
      return Object.keys(result).length > 0 ? result : false;
    },
  },
];

/**
 * @note populates file error modal
 * @param payload
 * @returns
 */
export const checkPayload = (payload: webTypes.IClientSidePayload): webTypes.IFileRule[] | false => {
  console.log({ payload });
  const errors = FILE_RULES.flatMap((rule) => {
    const err = rule.condition(payload);
    return err ? [{ name: rule.name, desc: rule.desc, data: err }] : [];
  });

  return errors.length > 0 ? errors : false;
};

/**
 * Compares fileIngestionTypes.IFileStats across hashes of fileIngestionTypes.IFileStats to determine matching file name/colum/type combos using MD5 to allow user to make a decision
 * @param {fileIngestionTypes.IFileStats[]}
 * @param {fileIngestionTypes.IFileStats[]}
 * @returns {webTypes.IMatchingFileStats[]}
 */
export const compareStats = (newFileStats, existingFileStats): webTypes.IMatchingFileStats[] => {
  // TODO: file name collisions
  // select and hash relevant values
  const newHashes = newFileStats.map(({ fileName, tableName, columns }) => MD5({ fileName, tableName, columns }));
  const existingHashes = newFileStats.map(({ fileName, tableName, columns }) => MD5({ fileName, tableName, columns }));

  // determine matches from hashes
  return newHashes
    .map((hash, idx) =>
      existingHashes.findIndex(hash) !== -1
        ? { new: newFileStats[idx], existing: existingFileStats[existingHashes.findIndex(hash)] }
        : null
    )
    .filter((el) => el !== null);
};
