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

function removePrefix(str: string, prefix: string): string {
  if (!str.startsWith(prefix)) {
    return str;
  }
  return str.slice(prefix.length);
}

const hashFileStats = (fileStats, existing) =>
  fileStats.map(({ fileName, tableName, columns }) => {
    const columnHashes = columns.map(({ name, fieldType }) => `${name}${fieldType}`).join('');
    const formattedColHash = existing ? removePrefix(columnHashes, 'glyphx_id__2') : columnHashes;
    return MD5(`${fileName}${tableName}${formattedColHash}`).toString();
  });

// Immutable pre-upload file rules
const FILE_RULES: webTypes.IFileRule[] = [
  {
    type: 'fileErrors',
    name: 'Duplicate column names',
    desc: 'Your csv has duplicate column names which is not allowed in model generation. Please de-duplicate the following columns and re-upload your file:',
    condition: (
      payload,
      existingFiles
    ):
      | {
          intraFileDuplicates?: { file: string; column: string }[];
          interFileDuplicates?: { columnName: string; duplicates: { fieldType: string; fileName: string }[] }[];
        }
      | false => {
      const intraFileDuplicates: { file: string; column: string }[] = [];
      const interFileDuplicates: { columnName: string; duplicates: { fieldType: string; fileName: string }[] }[] = [];
      const nameTypes = new Map<string, Map<number, string[]>>();

      // Combine payload.fileStats and existingFiles into a new array
      const allFileStats = [...payload.fileStats, ...existingFiles];

      for (const fileStat of allFileStats) {
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
            } else {
              types.set(columnType, [fileStat.fileName]);
            }
          } else {
            nameTypes.set(columnName, new Map<number, string[]>([[columnType, [fileStat.fileName]]]));
          }
        }
      }

      // Populate interFileDuplicates
      for (const [columnName, types] of nameTypes.entries()) {
        if (types.size > 1) {
          const typeArr = Array.from(types.entries()).map(([fieldType, fileNames]) => ({
            fieldType: fileIngestionTypes.constants.FIELD_TYPE[fieldType],
            fileName: fileNames.join(', '),
          }));
          interFileDuplicates.push({ columnName: columnName, duplicates: typeArr });
        }
      }

      const result: {
        intraFileDuplicates?: { file: string; column: string }[];
        interFileDuplicates?: { columnName: string; duplicates: { fieldType: string; fileName: string }[] }[];
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
  {
    type: 'fileDecisions',
    name: 'Duplicate file structure',
    desc: 'At least one of your csv looks like a pre-existing upload. If you would like to append data to the existing table, choose APPEND, if you want to create a new table, choose ADD',
    condition: (payload, existingFileStats): webTypes.IMatchingFileStats[] => {
      // select and hash relevant values
      const newHashes = hashFileStats(payload.fileStats, false);

      const existingHashes = hashFileStats(existingFileStats, true);

      // determine matches from hashes
      const retval = newHashes
        .map((hash, idx) =>
          existingHashes.findIndex((existingHash) => existingHash === hash) !== -1
            ? {
                newFile: payload.fileStats[idx].fileName,
                existingFile:
                  existingFileStats[existingHashes.findIndex((existingHash) => existingHash === hash)].fileName,
              }
            : null
        )
        .filter((el) => el !== null);

      return retval.length > 0 ? retval : false;
    },
  },
];

/**
 * @note populates file error modal
 * @param payload
 * @returns
 */
export const checkPayload = (
  payload: webTypes.IClientSidePayload,
  existingFiles: fileIngestionTypes.IFileStats[]
): webTypes.IFileRule[] | false => {
  const errors = FILE_RULES.flatMap((rule) => {
    const err = rule.condition(payload, existingFiles);
    return err ? [{ ...rule, data: err }] : [];
  });

  return errors.length > 0 ? errors : false;
};
