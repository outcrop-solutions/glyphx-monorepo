import {webTypes} from 'types';

/**
 * Determine collision case
 * @param fileColumnsHash
 * @param columnsHash
 * @param existingHashes
 * @param idx
 */
export const handleCollisionCase = (
  fileColumnsHash: string,
  columnsHash: string,
  existingHashes: {fileColumnsHash: string; columnsHash: string}[],
  idx: number
): webTypes.constants.COLLISION_CASE | undefined => {
  const fileCollision: boolean = fileColumnsHash === existingHashes[idx]?.fileColumnsHash;
  const colCollision: boolean = columnsHash === existingHashes[idx]?.columnsHash;
  if (fileCollision && colCollision) {
    return webTypes.constants.COLLISION_CASE.FILE_NAME_COLUMNS;
  } else if (fileCollision) {
    return webTypes.constants.COLLISION_CASE.FILE_NAME;
  } else if (colCollision) {
    return webTypes.constants.COLLISION_CASE.COLUMNS;
  } else {
    return undefined;
  }
};
