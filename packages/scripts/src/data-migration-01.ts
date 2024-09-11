import {HashResolver, LatestHashStrategy} from 'business/src/util/HashResolver';
import {S3Manager} from 'core/src/aws';
const TARGET_S3_BUCKET_NAME = 'glyphx-dev';
import {MongoDbConnection} from 'database';
import {databaseTypes, hashTypes} from 'types';
import {writeFile} from 'fs-extra';

const DUMP_STATES = false;
const DUMP_STATS = true;

const EXTS = ['.sgc', '.sdt', '.sgn'];

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

  const files = await s3.listObjects('client/');

  // information for statictics
  // CASE 1
  const invalidStates: hashTypes.StateParams[] = []; // invalid shape (no reference in mongo)
  // CASE 2
  const soundStates: hashTypes.IResolvedState[] = []; // can be found in s3 and are self-referentially consistent
  // CASE 3
  const unresolvedStates: hashTypes.IResolvedState[] = []; // unresolved in s3 but has integrity
  // CASE 4
  const corruptResolvableStates: hashTypes.IResolvedState[] = []; // hash values cannot be derived from the rest of the state but nonetheless are found in s3
  const shitStates: hashTypes.IResolvedState[] = []; // hash values cannot be derived from the rest of the state nor are they in s3

  // concurrently categorize each state based on data integrity status
  await Promise.all(
    states.map(async (state: databaseTypes.IState) => {
      // check state params
      const params = getParams(state);
      if (!params.ok) {
        // CASE 1: get rid of them
        invalidStates.push(params);
      } else {
        const {workspaceId, projectId, stateId, payloadHash, files, properties, fileHash} = params;
        try {
          const req = {
            projectId,
            files,
            properties,
          };
          const resolver = new HashResolver(workspaceId as any, projectId as any, s3);
          // check s3 integrity
          const resolution = await resolver.resolve(req);
          const resolved = typeof resolution !== 'undefined';
          // check self-referential integrity
          const integrity = resolver.check(fileHash, payloadHash, req);

          // CASE 2: do nothing
          if (resolved && integrity) {
            soundStates.push({stateId, projectId, workspaceId, payloadHash, resolution});
          }
          // CASE 3: re-calculate (fix self-referential integrity) and re-generate
          if (!resolved && integrity) {
            unresolvedStates.push({stateId, projectId, workspaceId, payloadHash, resolution});
          }
          // CASE 4: re-calculate (fix self-referential integrity) and rename existing data in s3
          if (resolved && !integrity) {
            corruptResolvableStates.push({stateId, projectId, workspaceId, payloadHash, resolution});
          }
          // CASE 5: get rid of them
          if (!resolved && !integrity) {
            shitStates.push({stateId, projectId, workspaceId, payloadHash, resolution});
          }
          return {ok: true};
        } catch (error) {
          console.log({error});
        }
      }
    })
  );

  // remove invalid param states from the other arrays
  //

  // if invalid params, delete
  // if resolvable and integral, do nothing
  // if unresolved and integral, and the fileSystemhash matches the current project hash regenerate the state
  // if resolvable and corrupt, re-calculate fileSystem and payloadHash values and re-generate using glyph engine
  // if unresolvable and corrupt re-calculate fileSystem and payloadHash values and update data

  // dump stats to debug results
  if (DUMP_STATS) {
    await dumpStats(files, states, invalidStates, soundStates, unresolvedStates, corruptResolvableStates, shitStates);
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
async function process(
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
      const oldFilePaths = EXTS.map((e) => `${basePath}/${state.payloadHash}.${e}`);
      const filePaths = EXTS.map((e) => `${basePath}/${payloadHash}.${e}`);

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

/**
 * Validate and extract state parameters
 * @param state
 * @returns
 */
function getParams(state: databaseTypes.IState): hashTypes.StateParams {
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
    };
  }
  if (!workspaceId || typeof workspaceId !== 'string') {
    console.log(`No workspace id found. stateId: ${stateId}, workspaceId: ${workspaceId}`);
    return {
      ok: false,
    };
  }
  if (!projectId || typeof projectId !== 'string') {
    console.log(`No project id found. stateId: ${stateId}, projectId: ${projectId}`);
    return {
      ok: false,
    };
  }
  // check data
  if (!Array.isArray(files) || files.length === 0) {
    console.log(`No files found. stateId: ${stateId}, files: ${JSON.stringify(files)}`);
    return {
      ok: false,
    };
  }
  if (typeof properties !== 'object' || Object.keys(properties).length === 0) {
    console.log(`No properties found. stateId: ${stateId}, files: ${JSON.stringify(files)}`);
    return {
      ok: false,
    };
  }
  // check hash values
  if (!fileHash || typeof fileHash !== 'string') {
    console.log(`No fileHash found. stateId: ${stateId}, fileHash: ${fileHash}`);
    return {
      ok: false,
    };
  }
  if (!payloadHash || typeof payloadHash !== 'string') {
    console.log(`No payloadHash found. stateId: ${stateId}, payloadHash: ${payloadHash}`);
    return {
      ok: false,
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

/**
 * Writes stats to the fs for debug purposes
 * @param files
 * @param states
 * @param invalidStates
 * @param soundStates
 * @param unresolvedStates
 * @param corruptResolveableStates
 * @param shitStates
 */
async function dumpStats(
  files: string[],
  states: databaseTypes.IState[],
  invalidStates: hashTypes.StateParams[], // state is missing an id or data property
  soundStates: hashTypes.IResolvedState[], // resolvable from s3
  unresolvedStates: hashTypes.IResolvedState[],
  corruptResolveableStates: Omit<hashTypes.IResolvedState, 'resolution'>[],
  shitStates: Omit<hashTypes.IResolvedState, 'resolution'>[]
) {
  // setup
  const filesToRemove = [];
  const corruptedProjects: string[] = [];
  const numVersions = new Set(soundStates.map((r) => r.resolution.version));
  // Exclude corrupted files/projects
  const datafiles = files.filter((f) => {
    // take advantage of already looping through files once to populate corrupt projects list
    if (f.includes('undefined')) {
      filesToRemove.push(f);
      const projectId = f.split('/')[2];
      corruptedProjects.push(projectId);
    }
    // apply filter
    return EXTS.some((ext) => !f.includes(`undefined${ext}`));
  });

  // files
  const filesLength = files.length;
  const inputFilesLength = files.length - datafiles.length;
  const outputFilesLength = datafiles.length;
  const corruptFiles = filesToRemove.length;
  // states
  const statesLength = states.length;
  const invalid = invalidStates.length;
  const sound = soundStates.length;
  const unresolved = unresolvedStates.length;
  const corruptedResolveable = corruptResolveableStates.length;
  const shit = shitStates.length;

  // checks if these numbers make sense
  const breakdown = invalid + sound + unresolved + corruptedResolveable + shit;
  const doesItAddup = statesLength === breakdown;
  // project
  const corruptPs = corruptedProjects.length;
  // versions
  const numVs = numVersions.size;

  // files
  console.log(`# files: ${filesLength}`); // 2037
  console.log(`# input data files: ${inputFilesLength}`); // 1099
  console.log(`# output data files: ${outputFilesLength}`); // 1099
  console.log(`# corrupted files: ${corruptFiles}`);
  // states
  console.log(`# states w/ payloadHash: ${statesLength}`); // 573 of 585 have payload hash
  for (const item of numVersions.values()) {
    console.log(`PayloadHash Version: ${item}`);
  }
  console.log(`# invalid states properties (params): ${invalid}`); // ?
  console.log(`# sound states: ${sound}`); // 373
  console.log(`# uresolvable states: ${unresolved}`); // 200
  console.log(`# corrupt state (no self-referencial strategy): ${corruptedResolveable}`); // ?
  console.log(`# shit states: ${shit}`); // ?
  // projects
  console.log(`# partially corrupted projects: ${corruptPs}`); // 4
  for (const pid of corruptedProjects) {
    console.log(`corrupt project: ${pid}`);
  }
  // versions
  console.log(`# hash strategies present: ${numVs}`);

  // dump stats
  const stats = {
    // corruptedProjects,
    // files,
    '#AddsUp': doesItAddup,
    '#files': filesLength,
    '#dataInputFiles': inputFilesLength,
    '#dataOutputFiles': outputFilesLength,
    // states,
    '#states': statesLength,
    '#versions': numVs,
    '#resolvableStates': sound,
    '#unresolvableStates': unresolved,
    '#corrupt': corruptedResolveable,
    '#corruptProjects': corruptPs,
  };
  await writeFile(`./migrationData/migration-stats.json`, JSON.stringify(stats));
  await writeFile(`./migrationData/resolutions.json`, JSON.stringify(soundStates));
}
// Execute the main function
main();
