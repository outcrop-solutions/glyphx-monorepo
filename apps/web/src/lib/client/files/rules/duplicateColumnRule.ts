import { web as webTypes, fileIngestion as fileIngestionTypes } from '@glyphx/types';

export const dusplicateColumnRule: webTypes.IFileRule = {
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
};
