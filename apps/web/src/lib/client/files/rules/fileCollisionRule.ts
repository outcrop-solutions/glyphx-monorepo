import { webTypes } from 'types';
import { hashFileStats } from '../transforms/hashFileStats';
import { handleCollisionCase } from '../mappings/handleCollisionCase';
import { handelOperations } from '../mappings/handleOperations';

export const fileCollisionRule: webTypes.IFileRule = {
  type: webTypes.constants.MODAL_CONTENT_TYPE.FILE_DECISIONS,
  name: 'File Upload Summary',
  desc: 'At least one of your csv looks like a pre-existing upload. Please choose which operations you would like to perform.',
  condition: (payload, existingFileStats, acceptedFiles: Blob[]): webTypes.MatchingFileStatsData => {
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

    // keep track of collisions to set default -1 (no-op)
    const foundIndexes: number[] = [];

    const retval = newHashes
      .map(({ fileColumnsHash, columnsHash }, idx) => {
        const foundIndex = findIndexInExistingHashes(fileColumnsHash, columnsHash);
        if (foundIndex !== -1) {
          return {
            newFile: payload.fileStats[idx].fileName,
            existingFile: existingFileStats[foundIndex].fileName,
            type: handleCollisionCase(fileColumnsHash, columnsHash, existingHashes, idx),
            operations: handelOperations(fileColumnsHash, columnsHash, existingHashes, idx),
          };
        } else {
          foundIndexes.push(foundIndex);
          return null;
        }
      })
      .filter((el) => el !== null);

    // set operations to no-op (-1) for conservative fileInfo default
    const cleanPayload = {
      ...payload,
      fileInfo: payload.fileInfo.map((info, idx) => {
        if (!foundIndexes.includes(idx)) {
          return { ...info, operation: -1 };
        } else return info;
      }),
    };

    return retval.length > 0
      ? { collisions: retval as webTypes.Collision[], payload: cleanPayload, acceptedFiles }
      : false;
  },
};
