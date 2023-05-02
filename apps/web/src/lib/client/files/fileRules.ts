import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';
import { hashFileStats } from './hashFileStats';
import { handleCollisionCase } from './handleCollisionCase';
import { handelOperations } from './handleOperations';

// Immutable pre-upload file rules
export const FILE_RULES: webTypes.IFileRule[] = [
  {
    type: webTypes.constants.MODAL_CONTENT_TYPE.FILE_ERRORS,
    name: 'Duplicate column names',
    desc: 'Your csv has duplicate column names which is not allowed in model generation. Please de-duplicate the following columns and re-upload your file:',
    condition: (payload, existingFiles): webTypes.DuplicateColumnData => {
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
    type: webTypes.constants.MODAL_CONTENT_TYPE.FILE_DECISIONS,
    name: 'File Upload Summary',
    desc: 'At least one of your csv looks like a pre-existing upload. If you would like to append data to the existing table, choose APPEND, if you want to create a new table, choose ADD',
    condition: (payload, existingFileStats): webTypes.MatchingFileStatsData => {
      // select and hash relevant values
      const newHashes = hashFileStats(payload.fileStats, false);
      const existingHashes = hashFileStats(existingFileStats, true);

      // CASES (show modal if 1-3 is present in array)
      // 1 - fileName different + cols same => [ADD|APPEND] = [2|1]
      // 2 - fileName same + cols different => [REPLACE|CANCEL] = [3|-]
      // 3 - fileName same + cols same => [REPLACE] = [3]

      // determine column matches from hashes
      const findIndexInExistingHashes = (fileColumnsHash, columnsHash) =>
        existingHashes.findIndex(
          ({ fileColumnsHash: existingFileColumnsHash, columnsHash: existingColumnsHash }) =>
            fileColumnsHash === existingFileColumnsHash || columnsHash === existingColumnsHash
        );

      const retval = newHashes
        .map(({ fileColumnsHash, columnsHash }, idx) => {
          const foundIndex = findIndexInExistingHashes(fileColumnsHash, columnsHash);
          return foundIndex !== -1
            ? {
                newFile: payload.fileStats[idx].fileName,
                existingFile: existingFileStats[foundIndex].fileName,
                type: handleCollisionCase(fileColumnsHash, columnsHash, existingHashes, idx),
                operations: handelOperations(fileColumnsHash, columnsHash, existingHashes, idx),
              }
            : null;
        })
        .filter((el) => el !== null);

      return retval.length > 0 ? retval : false;
    },
  },
];
