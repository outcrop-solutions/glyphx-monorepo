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
  const proj = cleanProjectIds(project);
  const projectStateProperties = JSON.stringify(proj.state.properties);
  const payload = `${fileHash}${projectStateProperties}`;

  console.dir({fileHash, payload}, {depth: null});

  return MD5(payload).toString();
}

const cleanProjectIds = (project) => {
  let cleanProject = {...project};
  // clean ids
  delete cleanProject.state.properties['X'].id;
  delete cleanProject.state.properties['Y'].id;
  delete cleanProject.state.properties['Z'].id;
  delete cleanProject.state.properties['A'].id;
  delete cleanProject.state.properties['B'].id;
  delete cleanProject.state.properties['C'].id;
  // clean filter ids
  delete cleanProject.state.properties['X'].filter.id;
  delete cleanProject.state.properties['Y'].filter.id;
  delete cleanProject.state.properties['Z'].filter.id;
  delete cleanProject.state.properties['A'].filter.id;
  delete cleanProject.state.properties['B'].filter.id;
  delete cleanProject.state.properties['C'].filter.id;

  for (const key of Object.keys(cleanProject.state.properties)) {
    const keywords = cleanProject.state.properties[key].keywords;
    if (keywords && keywords.length === 0) {
      delete cleanProject.state.properties[key].filter.keywords;
    }
  }
  return cleanProject;
};
