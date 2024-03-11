//@ts-ignore
import MD5 from 'crypto-js/md5';
import {databaseTypes} from 'types';

/**
 * Performs payload hashing operation
 * @param fileHash
 * @param project
 * @returns
 */
export function hashPayload(fileHash: string, project: databaseTypes.IProject): string {
  const projectStateProperties = JSON.stringify(project.state.properties);
  const payload = `${fileHash}${projectStateProperties}`;

  console.dir({project}, {depth: null});
  console.dir({projectStateProperties}, {depth: null});
  console.dir({fileHash}, {depth: null});
  console.dir({payload}, {depth: null});

  console.dir({fileHash, project, projectStateProperties, payload}, {depth: null});

  return MD5(payload).toString();
}
