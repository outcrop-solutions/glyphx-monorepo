import {HashResolver, LatestHashStrategy} from 'business/src/util/HashResolver';
import {S3Manager} from 'core/src/aws';
const TARGET_S3_BUCKET_NAME = 'glyphx-dev';
import {MongoDbConnection} from 'database';
import {databaseTypes, hashTypes} from 'types';
import {writeFile} from 'fs-extra';

const DUMP_STATES = true;
const DUMP_STATS = true;

async function main() {
  const versionMap = new Map();
  const s3 = new S3Manager(TARGET_S3_BUCKET_NAME);
  await s3.init();
  // get iterables from mongo
  const connection = new MongoDbConnection();
  await connection.init();
  const states = (await connection.models.StateModel.find({
    payloadHash: {$ne: null},
  })
    .select('payloadHash fileSystemHash project workspace') // Ensure these fields are included
    .populate('project') // Populate references if needed
    .populate('workspace') // Populate references if needed
    .lean()) as databaseTypes.IState[]; // Cast to IState[]

  const exts = ['.sgc', '.sdt', '.sgn'];
  const files = await s3.listObjects('client/');

  const resolutions = [];

  // Determine state integrity
  for (const state of states) {
    const params = getParams(state);
    if (params) {
      const {workspaceId, projectId} = params;
      try {
        const resolver = new HashResolver(workspaceId as any, projectId as any, s3);
        const resolution = await resolver.resolve({type: 'state', state});
        const retval = await processResolution(exts, params, state, resolution, connection, s3);
        resolutions.push(retval);
      } catch (error) {
        console.log({error});
      }
    }
  }

  // dump stats to debug results
  if (DUMP_STATS) {
    await dumpStats(files, states, versionMap, resolutions as any, exts);
  }
  // dump states for faster access on re-run
  if (DUMP_STATES) {
    await writeFile(`./migrationData/states.json`, JSON.stringify(states));
  }
}

/**
 *  If resolver did not use latest version, recalculate them, update state, and rename file in S3
 * @param params
 * @param state
 * @param resolution
 */
async function processResolution(
  exts: string[],
  params: Record<string, string>,
  state: databaseTypes.IState,
  resolution: hashTypes.IResolution,
  db: any,
  s3: S3Manager
) {
  try {
    const {workspaceId, projectId, stateId} = params;
    if (resolution.version !== 'latest') {
      // recreate project structure for payloadHash construction
      const project = {
        id: projectId,
        state,
      } as unknown as databaseTypes.IProject;

      const s = new LatestHashStrategy();
      const fileSystemHash = s.hashFiles(state.fileSystem);
      const payloadHash = s.hashPayload(fileSystemHash, project);

      // build file paths
      const basePath = `client/${workspaceId}/${projectId}/output`;
      const oldFilePaths = exts.map((e) => `${basePath}/${state.payloadHash}.${e}`);
      const filePaths = exts.map((e) => `${basePath}/${payloadHash}.${e}`);
      // concurrently check success of migration
      const success: hashTypes.IDataPresence[] = await Promise.all(
        filePaths.map(async (newPath, idx) => {
          const oldPath = oldFilePaths[idx];
          await s3.copyObject(oldPath, newPath);
          return {exists: await s3.fileExists(newPath), path: newPath};
        })
      );
      // if s3 migration successful, update state
      const allFilesExist = success.every((p) => p.exists);
      if (allFilesExist) {
        // update state
        await db.models.StateModel.updateStateById(stateId, {
          fileSystemHash,
          payloadHash,
        });
      }
    }
  } catch (error) {
    console.log({error});
  }
}

function getParams(
  state: databaseTypes.IState
): {workspaceId: string; projectId: string; stateId: string; payloadHash: string} | null {
  const stateId = state?._id?.toString();
  const workspaceId = state?.workspace?._id?.toString(); // Assume `workspaceId` is part of state
  const projectId = state?.project?._id?.toString(); // Assume `projectId` is part of state
  // const retval = await StateService.getState(stateId);
  const payloadHash = state?.payloadHash; // Assume `payloadHash` is part of state

  if (!stateId || typeof stateId !== 'string') {
    console.log(`No state id found. stateId: ${stateId}, stateId: ${stateId}`);
    return null;
  }
  if (!workspaceId || typeof workspaceId !== 'string') {
    console.log(`No workspace id found. stateId: ${stateId}, workspaceId: ${workspaceId}`);
    return null;
  }
  if (!projectId || typeof projectId !== 'string') {
    console.log(`No project id found. stateId: ${stateId}, projectId: ${projectId}`);
    return null;
  }
  if (!payloadHash || typeof payloadHash !== 'string') {
    console.log(`No workspace id found. stateId: ${stateId}, payloadHash: ${payloadHash}`);
    return null;
  }

  return {
    stateId,
    projectId,
    workspaceId,
    payloadHash,
  };
}

async function dumpStats(
  files: string[],
  states: databaseTypes.IState[],
  versionMap: Map<string, hashTypes.IResolution>,
  resolutions: {
    projectId: string;
    workspaceId: string;
    payloadHash: string;
    resolution: hashTypes.IResolution | false;
  }[],
  exts: string[]
) {
  const filesToRemove = [];
  const corruptedProjects: string[] = [];
  console.log(`Total number of files: ${files.length}`); // 2037
  console.log(`Total number of states: ${states.length}`); // 573 of 585 have payload hash
  console.log(`Total number of payload versions present: ${versionMap.size}`);
  for (const key of versionMap.keys()) {
    console.log(`PayloadHash Version: ${key}`);
  }

  // Split states based on integrity
  const fullStates = resolutions.filter((p) => p.resolution);
  const corruptedStates = resolutions.filter((p) => !p.resolution);
  console.log(`Total number of currently resolvable states: ${fullStates.length}`); // 373
  console.log(`Total number of incomplete states: ${corruptedStates.length}`); // 200

  // Filter files based on extensions, excluding 'undefined' files
  const datafiles = files.filter((f) => {
    // take advantage of already looping through files once to populate corrupt projects list
    if (f.includes('undefined')) {
      filesToRemove.push(f);
      const projectId = f.split('/')[2];
      corruptedProjects.push(projectId);
    }
    // apply filter
    return exts.some((ext) => f.endsWith(ext) && !f.includes(`undefined${ext}`));
  });

  console.log(`Total number of partially corrupted projects: ${corruptedProjects.length}`); //
  for (const pid of corruptedProjects) {
    console.log(`corrupt project: ${pid}`);
  }
  console.log(`Total number of output data files: ${datafiles.length}`); // 1099
  console.log(`Total number of corrupted files: ${filesToRemove.length}`);

  // dump stats
  const stats = {
    // files,
    // states,
    // corruptedProjects,
    numberFiles: files.length,
    numberDataOutputFiles: datafiles.length,
    numberDataInputFiles: files.length - datafiles.length,
    numberStates: states.length,
    numberStatesIntactBefore: fullStates.length,
    numberStatesCorruptBefore: corruptedStates.length,
    numberCorruptProjects: corruptedProjects.length,
  };
  await writeFile(`./migrationData/migration-stats.json`, JSON.stringify(stats));
  await writeFile(`./migrationData/resolutions.json`, JSON.stringify(resolutions));
}
// Execute the main function
main();
