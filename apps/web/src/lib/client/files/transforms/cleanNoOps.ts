import {webTypes, fileIngestionTypes} from 'types';

/**
 * Cleans payload in case user ops to CANCEL a FILE_OPERATION
 * @param payload
 * @returns
 */
export const cleanNoOps = (payload: webTypes.IClientSidePayload, acceptedFiles: File[]) => {
  // filter out no-ops
  const cleanFileInfo = payload.fileInfo.filter(
    (info) => (info.operation as unknown as fileIngestionTypes.constants.FILE_OPERATION | -1) !== -1
  );
  const cleanList = cleanFileInfo.map((i) => i.fileName);

  // Generate an array of indexes to keep
  const indexesToKeep: number[] = payload.fileStats.reduce(
    (acc: number[], stat: fileIngestionTypes.IFileStats, index: number) => {
      if (cleanList.includes(stat.fileName)) {
        acc.push(index);
      }
      return acc;
    },
    []
  );

  // Filter out fileStats using the array of indexes
  const cleanFileStats = payload.fileStats.filter((_, idx) => indexesToKeep.includes(idx));

  // Filter out no-op buffers using array of indexes
  const cleanFiles = acceptedFiles.filter((_, idx) => indexesToKeep.includes(idx));

  return {
    cleanPayload: {
      ...payload,
      fileInfo: cleanFileInfo,
      fileStats: cleanFileStats,
    },
    cleanFiles,
  };
};
