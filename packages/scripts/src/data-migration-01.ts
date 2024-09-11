import {HashResolver, LatestHashStrategy} from 'business/src/util/HashResolver';
import {S3Manager} from 'core/src/aws';
const TARGET_S3_BUCKET_NAME = 'glyphx-dev';
import {MongoDbConnection} from 'database';
import {databaseTypes, hashTypes} from 'types';
import {writeFile} from 'fs-extra';

const DUMP_STATES = true;
const DUMP_STATS = true;

async function main() {
  const s3 = new S3Manager(TARGET_S3_BUCKET_NAME);
  await s3.init();
  // get iterables from mongo
  const connection = new MongoDbConnection();
  await connection.init();
  // const states: any[] = [];
  const states = (await connection.models.StateModel.find({
    payloadHash: {$ne: null},
  })
    .select('properties fileSystem payloadHash fileSystemHash project workspace') // Ensure these fields are included
    .populate('project') // Populate references if needed
    .populate('workspace') // Populate references if needed
    .lean()) as databaseTypes.IState[]; // Cast to IState[]

  const exts = ['.sgc', '.sdt', '.sgn'];
  const files = await s3.listObjects('client/');

  const retvals: Retval[] = [];
  const invalidParams: Params[] = [];

  // Determine state integrity
  await Promise.all(
    states.map(async (state: databaseTypes.IState) => {
      // @ts-ignore
      // const state = (await connection.models.StateModel.findById('64ca724c7a1452ba4c0e6e74')
      //   .select('properties fileSystem fileSystemHash payloadHash project workspace') // Ensure these fields are included
      //   .populate('project') // Populate references if needed
      //   .populate('workspace') // Populate references if needed
      //   .lean()) as databaseTypes.IState; // Cast to IState;

      const params = getParams(state);
      if (params.ok) {
        const {workspaceId, projectId, stateId, payloadHash, files, properties} = params;
        try {
          const resolver = new HashResolver(workspaceId as any, projectId as any, s3);
          const resolution = await resolver.resolve({
            projectId,
            files,
            properties,
          });
          // const retval = await processResolution(exts, params, state, resolution, connection, s3);
          if (typeof resolution !== 'undefined') {
            retvals.push({stateId, projectId, workspaceId, payloadHash, resolution});
            return resolution;
          }
        } catch (error) {
          console.log({error});
        }
      } else {
        invalidParams.push(params);
      }
    })
  );

  // dump stats to debug results
  if (DUMP_STATS) {
    await dumpStats(files, states, invalidParams, retvals, exts);
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
  params: Record<string, any>,
  state: databaseTypes.IState,
  resolution: hashTypes.IResolution,
  db: any,
  s3: S3Manager
) {
  try {
    const {workspaceId, projectId, stateId, files, properties} = params;
    if (resolution.version !== 'latest') {
      const s = new LatestHashStrategy();
      const fileSystemHash = s.hashFiles(state.fileSystem);
      const payload = {
        projectId,
        files,
        properties,
      };
      const payloadHash = s.hashPayload(fileSystemHash, payload);

      // build file paths
      const basePath = `client/${workspaceId}/${projectId}/output`;
      const oldFilePaths = exts.map((e) => `${basePath}/${state.payloadHash}.${e}`);
      const filePaths = exts.map((e) => `${basePath}/${payloadHash}.${e}`);

      // concurrently check success of s3 migration
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

type Params = {
  ok: boolean;
  workspaceId: string;
  projectId: string;
  stateId: string;
  payloadHash: string;
  fileHash: string;
  files: databaseTypes.IProject['files'];
  properties: databaseTypes.IProject['state']['properties'];
};

/**
 * Validate and extract state parameters
 * @param state
 * @returns
 */
function getParams(state: databaseTypes.IState): Params {
  // ids
  const stateId = state?._id?.toString();
  const workspaceId = state?.workspace?._id?.toString();
  const projectId = state?.project?._id?.toString();
  // data
  const files = state?.fileSystem;
  const properties = state?.properties;
  // hash values
  const fileHash = state?.fileSystemHash;
  const payloadHash = state?.payloadHash;
  // check ids
  if (!stateId || typeof stateId !== 'string') {
    console.log(`No state id found. stateId: ${stateId}, stateId: ${stateId}`);
    // @ts-ignore
    return {
      ok: false,
      // @ts-ignore
      stateId,
      // @ts-ignore
      projectId,
      // @ts-ignore
      workspaceId,
      files,
      properties,
      fileHash,
      payloadHash,
    };
  }
  if (!workspaceId || typeof workspaceId !== 'string') {
    console.log(`No workspace id found. stateId: ${stateId}, workspaceId: ${workspaceId}`);
    return {
      ok: false,
      stateId,
      // @ts-ignore
      projectId,
      // @ts-ignore
      workspaceId,
      files,
      properties,
      fileHash,
      payloadHash,
    };
  }
  if (!projectId || typeof projectId !== 'string') {
    console.log(`No project id found. stateId: ${stateId}, projectId: ${projectId}`);
    return {
      ok: false,
      stateId,
      // @ts-ignore
      projectId,
      workspaceId,
      files,
      properties,
      fileHash,
      payloadHash,
    };
  }
  // check data
  if (!Array.isArray(files) || files.length === 0) {
    console.log(`No files found. stateId: ${stateId}, files: ${JSON.stringify(files)}`);
    return {
      ok: false,
      stateId,
      projectId,
      workspaceId,
      files,
      properties,
      fileHash,
      payloadHash,
    };
  }
  if (typeof properties !== 'object' || Object.keys(properties).length === 0) {
    console.log(`No properties found. stateId: ${stateId}, files: ${JSON.stringify(files)}`);
    return {
      ok: false,
      stateId,
      projectId,
      workspaceId,
      files,
      properties,
      fileHash,
      payloadHash,
    };
  }
  // check hash values
  if (!fileHash || typeof fileHash !== 'string') {
    console.log(`No fileHash found. stateId: ${stateId}, fileHash: ${fileHash}`);
    return {
      ok: false,
      stateId,
      projectId,
      workspaceId,
      files,
      properties,
      fileHash,
      payloadHash,
    };
  }
  if (!payloadHash || typeof payloadHash !== 'string') {
    console.log(`No payloadHash found. stateId: ${stateId}, payloadHash: ${payloadHash}`);
    return {
      ok: false,
      stateId,
      projectId,
      workspaceId,
      files,
      properties,
      fileHash,
      payloadHash,
    };
  }

  return {
    ok: true,
    stateId,
    projectId,
    workspaceId,
    files,
    properties,
    fileHash,
    payloadHash,
  };
}

type Retval = {
  stateId: string;
  projectId: string;
  workspaceId: string;
  payloadHash: string;
  resolution: hashTypes.IResolution;
};

async function dumpStats(
  files: string[],
  states: databaseTypes.IState[],
  invalid: Params[],
  retvals: Retval[],
  exts: string[]
) {
  const filesToRemove = [];
  const corruptedProjects: string[] = [];
  console.log(`Total number of files: ${files.length}`); // 2037
  console.log(`Total number of states that have a payloadHash: ${states.length}`); // 573 of 585 have payload hash

  const numVersions = new Set(retvals.map((r) => r.resolution.version));
  console.log(`Total number of payload versions present: ${numVersions.size}`); // 3
  for (const item of numVersions.values()) {
    console.log(`PayloadHash Version: ${item}`);
  }

  // Split states based on integrity
  const fullStates = retvals.length;
  const corruptedStates = states.length - fullStates;

  console.log(`Resolvable states: ${retvals.length}`); // 373
  // TODO: find number of states whose hash values are incorrect vs their file does not exist but it is calculated properly

  console.log(`Unresolvable states: ${states.length - retvals.length}`); // 200
  console.log(`Total number of invalid states: ${invalid.length}`); // ?

  // console.log(`Full State 1 ${retvals.stateId}`);

  // Filter files based on extensions, excluding 'undefined' files
  const datafiles = files.filter((f) => {
    // take advantage of already looping through files once to populate corrupt projects list
    if (f.includes('undefined')) {
      filesToRemove.push(f);
      const projectId = f.split('/')[2];
      corruptedProjects.push(projectId);
    }
    // apply filter
    return exts.some((ext) => !f.includes(`undefined${ext}`));
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
    numberStatesIntactBefore: fullStates,
    numberStatesCorruptBefore: corruptedStates,
    numberCorruptProjects: corruptedProjects.length,
  };
  await writeFile(`./migrationData/migration-stats.json`, JSON.stringify(stats));
  await writeFile(`./migrationData/resolutions.json`, JSON.stringify(retvals));
}
// Execute the main function
main();
