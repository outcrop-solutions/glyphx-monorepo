import MD5 from 'crypto-js/md5';
import {database as databaseTypes} from '@glyphx/types';

/**
 * Performs payload hashing operation
 * @param fileHash
 * @param project
 * @returns
 */
export function hashPayload(
  fileHash: string,
  project: databaseTypes.IProject
): string {
  const projectStateProperties = JSON.stringify(project.state.properties);

  const payload = `${fileHash}${projectStateProperties}`;

  return MD5(payload).toString();
}
