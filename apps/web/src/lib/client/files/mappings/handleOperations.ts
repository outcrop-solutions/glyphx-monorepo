import {webTypes, fileIngestionTypes} from 'types';
import {handleCollisionCase} from './handleCollisionCase';

export const handelOperations = (
  fileColumnsHash: string,
  columnsHash: string,
  existingHashes: {fileColumnsHash: string; columnsHash: string}[],
  idx: number
): (fileIngestionTypes.constants.FILE_OPERATION | -1)[] | undefined => {
  const collisionCase = handleCollisionCase(fileColumnsHash, columnsHash, existingHashes, idx);

  switch (collisionCase) {
    case webTypes.constants.COLLISION_CASE.FILE_NAME:
      return [3, -1]; // [REPLACE/NO-OP]
    case webTypes.constants.COLLISION_CASE.COLUMNS:
      return [1, 2]; // [APPEND/ADD/NO-OP]
    case webTypes.constants.COLLISION_CASE.FILE_NAME_COLUMNS:
      return [3, -1]; // [REPLACE/NO-OP]
    default:
      break;
  }
};
