import {HashResolver, LatestHashStrategy} from 'business/src/util/HashResolver';
import {MongoDbConnection} from 'database';
import {athenaConnection, s3Connection} from 'business/src/lib';
import {databaseTypes, fileIngestionTypes, glyphEngineTypes, hashTypes, webTypes} from 'types';
import {writeFile} from 'fs-extra';
import {ProcessTrackingService} from 'business/src/services/processTracking';
import {GlyphEngine} from 'glyphengine';
import {generalPurposeFunctions} from 'core';
import {generateFilterQuery} from 'actions/src/utils/generateFilterQuery';

interface IMigrationError {
  case: string;
  stateId: string;
  errMsg: string;
}

const DRY = true;
const DUMP_STATES = false;
const DUMP_STATS = true;

const EXTS = ['.sgc', '.sdt', '.sgn'];

async function main() {
  await s3Connection.init();
  const s3 = s3Connection.s3Manager;
  // const s3 = new S3Manager(TARGET_S3_BUCKET_NAME);
  // get iterables from mongo
  const db = new MongoDbConnection();
  await db.init();
  // const states: any[] = [];
  const states = (await db.models.StateModel.find({
    payloadHash: {$ne: null},
    deletedAt: {$ne: undefined},
  })
    .select('properties fileSystem payloadHash fileSystemHash project workspace') // Ensure these fields are included
    .populate('project') // Populate references if needed
    .populate('workspace') // Populate references if needed
    .lean()) as databaseTypes.IState[]; // Cast to IState[]

  const files = await s3.listObjects('client/');

  // CASE 1
  const invalidStates: hashTypes.StateParams[] = []; // invalid shape (no reference in mongo)
  // CASE 2
  const soundStates: hashTypes.IStateRetval[] = []; // can be found in s3 and are self-referentially consistent
  // CASE 3
  const unresolvedStates: hashTypes.IStateRetval[] = []; // unresolved in s3 but has integrity
  // CASE 4
  const corruptResolvableStates: hashTypes.IStateRetval[] = []; // hash values cannot be derived from the rest of the state but nonetheless are found in s3
  // CASE 5
  const corruptStates: hashTypes.IStateRetval[] = []; // hash values cannot be derived from the rest of the state nor are they in s3

  const errors: IMigrationError[] = [];

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
          const retval = {
            stateId,
            projectId,
            workspaceId,
            payloadHash,
            fileHash,
            resolution,
            files,
            properties,
            integrity,
          };
          // CASE 2: do nothing
          if (resolved && integrity.ok) {
            soundStates.push(retval);
          }
          // CASE 3: re-calculate (fix self-referential integrity) and re-generate
          if (!resolved && integrity.ok) {
            unresolvedStates.push(retval);
          }
          // CASE 4: re-calculate (fix self-referential integrity) and rename existing data in s3
          if (resolved && !integrity.ok) {
            corruptResolvableStates.push(retval);
          }
          // CASE 5: get rid of them
          if (!resolved && !integrity.ok) {
            corruptStates.push(retval);
          }
          return {ok: true};
        } catch (error) {
          console.log({error});
        }
      }
    })
  );

  if (!DRY) {
    // if invalid params, delete if stateId exists
    await Promise.all(
      [...invalidStates, ...corruptStates]
        .filter((s) => s.stateId)
        .map(async ({stateId}) => {
          await db.models.StateModel.updateStateById(stateId, {
            deletedAt: new Date(),
          });
        })
    );

    // try regenerating the state and putting it in s3, otherwise delete
    // await Promise.all(
    //   unresolvedStates.map(
    //     async ({stateId, projectId, workspaceId, files, properties, fileHash, payloadHash, integrity}) => {
    //       try {
    //         let ph: string = payloadHash;
    //         let fh: string = fileHash;

    //         // integrity may be sound, but if it is not up to date, we re-calculate it
    //         // note: we cannot get this from the resolution object because by definition, these states do not resolve
    //         if (integrity.version !== 'latest' || !integrity.ok) {
    //           const s = new LatestHashStrategy();
    //           const hashPayload = {
    //             projectId,
    //             files,
    //             properties,
    //           };
    //           fh = s.hashFiles(files);
    //           ph = s.hashPayload(fh, hashPayload);
    //         }

    //         /**
    //          * THIS IS COPIED FROM THE ACTIONS PACKAGE
    //          * to avoid having to change the actions GE to fit out needs
    //          */
    //         const payload = {
    //           model_id: projectId,
    //           payload_hash: ph,
    //           client_id: workspaceId,
    //           x_axis: properties[webTypes.constants.AXIS.X]['key'],
    //           x_date_grouping:
    //             properties[webTypes.constants.AXIS.X]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE &&
    //             !properties[webTypes.constants.AXIS.X]['dateGrouping']
    //               ? glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR
    //               : properties[webTypes.constants.AXIS.X]['dateGrouping'],
    //           y_axis: properties[webTypes.constants.AXIS.Y]['key'],
    //           y_date_grouping:
    //             properties[webTypes.constants.AXIS.Y]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE &&
    //             !properties[webTypes.constants.AXIS.Y]['dateGrouping']
    //               ? glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR
    //               : properties[webTypes.constants.AXIS.Y]['dateGrouping'],
    //           z_axis: properties[webTypes.constants.AXIS.Z]['key'],
    //           accumulatorType: properties[webTypes.constants.AXIS.Z]['accumulatorType'],
    //           x_func: properties[webTypes.constants.AXIS.X]['interpolation'],
    //           y_func: properties[webTypes.constants.AXIS.Y]['interpolation'],
    //           z_func: properties[webTypes.constants.AXIS.Z]['interpolation'],
    //           x_direction: properties[webTypes.constants.AXIS.X]['direction'],
    //           y_direction: properties[webTypes.constants.AXIS.Y]['direction'],
    //           z_direction: properties[webTypes.constants.AXIS.Z]['direction'],
    //           filter: generateFilterQuery(properties),
    //         };
    //         // Setup process tracking
    //         const PROCESS_ID = generalPurposeFunctions.processTracking.getProcessId();
    //         const PROCESS_NAME = 'testingProcessUnique';
    //         await ProcessTrackingService.createProcessTracking(PROCESS_ID, PROCESS_NAME);

    //         const glyphEngine = new GlyphEngine(s3, s3, athenaConnection.connection, PROCESS_ID);
    //         await glyphEngine.init();

    //         let data: Map<string, string>;
    //         // @ts-ignore
    //         data = new Map<string, string>([
    //           // axes
    //           ['x_axis', payload['x_axis']],
    //           ['y_axis', payload['y_axis']],
    //           ['z_axis', payload['z_axis']],
    //           // interpolation
    //           ['x_func', payload['x_func']],
    //           ['y_func', payload['y_func']],
    //           ['z_func', payload['z_func']],
    //           // direction
    //           ['x_direction', payload['x_direction']],
    //           ['y_direction', payload['y_direction']],
    //           ['z_direction', payload['z_direction']],
    //           // dates and accumulator
    //           ['x_date_grouping', payload['x_date_grouping']],
    //           ['y_date_grouping', payload['y_date_grouping']],
    //           ['accumulatorType', payload['accumulatorType']],
    //           // model info
    //           ['model_id', payload['model_id']],
    //           ['client_id', payload['client_id']],
    //           ['payload_hash', payload['payload_hash']],
    //           // filter
    //           ['filter', payload['filter']],
    //         ]);
    //         // process glyph engine
    //         const retval = await glyphEngine.process(data);
    //         // END OF ACTIONS PACKAGE GE COPY

    //         // sync up state depending on GE outcome
    //         if (retval) {
    //           await db.models.StateModel.updateStateById(stateId, {
    //             fileSystemHash: fh,
    //             payloadHash: ph,
    //           });
    //         } else {
    //           // this might be unecessary
    //           await db.models.StateModel.updateStateById(stateId, {
    //             deletedAt: new Date(),
    //           });
    //         }
    //       } catch (error) {
    //         errors.push({case: 'unresolved', stateId, errMsg: JSON.stringify(error)});
    //         // If we can't re-generate the data, we soft-delete
    //         await db.models.StateModel.updateStateById(stateId, {
    //           deletedAt: new Date(),
    //         });
    //       }
    //     }
    //   )
    // );

    // restore self-referential integrity, and then rename the old, resolveable data files
    // await Promise.all(
    //   corruptResolvableStates.map(
    //     async ({stateId, projectId, workspaceId, files, properties, fileHash, payloadHash, resolution}) => {
    //       try {
    //         let ph: string = payloadHash;
    //         let fh: string = fileHash;

    //         // state may resolve, but if it is not up to date, we re-calculate it
    //         // note: we cannot get this from the integroty object because by definition, these states are corrupt self-referentially
    //         if (resolution.version !== 'latest') {
    //           const s = new LatestHashStrategy();
    //           const hashPayload = {
    //             projectId,
    //             files,
    //             properties,
    //           };
    //           fh = s.hashFiles(files);
    //           ph = s.hashPayload(fh, hashPayload);
    //         }

    //         // build file paths
    //         const basePath = `client/${workspaceId}/${projectId}/output`;
    //         const oldFilePaths = EXTS.map((e) => `${basePath}/${payloadHash}.${e}`);
    //         const filePaths = EXTS.map((e) => `${basePath}/${payloadHash}.${e}`);

    //         // concurrently rename data files in s3 and return status
    //         const success: hashTypes.IDataPresence[] = await Promise.all(
    //           filePaths.map(async (newPath, idx) => {
    //             const oldPath = oldFilePaths[idx];
    //             await s3.copyObject(oldPath, newPath);
    //             return {exists: await s3.fileExists(newPath), path: newPath};
    //           })
    //         );

    //         // if s3 migration successful, update state
    //         const allFilesExist = success.every((p) => p.exists);
    //         if (allFilesExist) {
    //           // update state
    //           await db.models.StateModel.updateStateById(stateId, {
    //             fileSystemHash: fh,
    //             payloadHash: ph,
    //           });
    //         } else {
    //           errors.push({case: 'corrupt', stateId, errMsg: 'not all files exist'});
    //         }
    //       } catch (error) {
    //         errors.push({case: 'corrupt', stateId, errMsg: JSON.stringify(error)});
    //       }
    //     }
    //   )
    // );
  }

  // dump stats to debug results
  if (DUMP_STATS) {
    await dumpStats(
      files,
      states,
      invalidStates,
      soundStates,
      unresolvedStates,
      corruptResolvableStates,
      corruptStates
    );
  }
  // dump states for faster access on re-run
  if (DUMP_STATES) {
    await writeFile(`./migrationData/states.json`, JSON.stringify(states));
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
    return {
      ok: false,
      stateId: '',
    };
  }
  if (!workspaceId || typeof workspaceId !== 'string') {
    console.log(`No workspace id found. stateId: ${stateId}, workspaceId: ${workspaceId}`);
    return {
      ok: false,
      stateId,
    };
  }
  if (!projectId || typeof projectId !== 'string') {
    console.log(`No project id found. stateId: ${stateId}, projectId: ${projectId}`);
    return {
      ok: false,
      stateId,
    };
  }
  // check data
  if (!Array.isArray(files) || files.length === 0) {
    console.log(`No files found. stateId: ${stateId}, files: ${JSON.stringify(files)}`);
    return {
      ok: false,
      stateId,
    };
  }
  if (typeof properties !== 'object' || Object.keys(properties).length === 0) {
    console.log(`No properties found. stateId: ${stateId}, files: ${JSON.stringify(files)}`);
    return {
      ok: false,
      stateId,
    };
  }
  // check hash values
  if (!fileHash || typeof fileHash !== 'string') {
    console.log(`No fileHash found. stateId: ${stateId}, fileHash: ${fileHash}`);
    return {
      ok: false,
      stateId,
    };
  }
  if (!payloadHash || typeof payloadHash !== 'string') {
    console.log(`No payloadHash found. stateId: ${stateId}, payloadHash: ${payloadHash}`);
    return {
      ok: false,
      stateId,
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
 * @param corruptStates
 */
async function dumpStats(
  files: string[],
  states: databaseTypes.IState[],
  invalidStates: hashTypes.StateParams[], // state is missing an id or data property
  soundStates: hashTypes.IStateRetval[], // resolvable from s3
  unresolvedStates: hashTypes.IStateRetval[],
  corruptResolveableStates: Omit<hashTypes.IStateRetval, 'resolution'>[],
  corruptStates: Omit<hashTypes.IStateRetval, 'resolution'>[]
) {
  // setup
  const filesToRemove: string[] = [];
  const corruptedProjects: string[] = [];
  const numVersions = new Set(soundStates.map((r) => r.resolution.version));
  // // Exclude corrupted files/projects
  for (const f of files) {
    // take advantage of already looping through files once to populate corrupt projects list
    if (f.includes('undefined')) {
      filesToRemove.push(f);
      const projectId = f.split('/')[2];
      corruptedProjects.push(projectId);
    }
    // apply filter
    return EXTS.some((ext) => !f.includes(`undefined${ext}`));
  }

  // calcs
  const filesLength = files.length;
  const corruptFiles = filesToRemove.length;
  const statesLength = states.length;
  const invalid = invalidStates.length;
  const sound = soundStates.length;
  const unresolved = unresolvedStates.length;
  const corruptedResolveable = corruptResolveableStates.length;
  const corrupt = corruptStates.length;
  const breakdown = invalid + sound + unresolved + corruptedResolveable + corrupt;
  const doesItAddup = statesLength === breakdown;
  const corruptPs = corruptedProjects.length;
  const numVs = numVersions.size;

  // logs
  console.log(`# files: ${filesLength}`); // 2037
  console.log(`# corrupted files: ${corruptFiles}`);
  console.log(`# non-deleted states w/ payloadHash: ${statesLength}`); // 573 of 585 have payload hash
  for (const item of numVersions.values()) {
    console.log(`PayloadHash Version: ${item}`);
  }
  console.log(`# invalid states properties (params): ${invalid}`); // ?
  console.log(`# sound states: ${sound}`); // 373
  console.log(`# uresolvable states: ${unresolved}`); // 200
  console.log(`# corrupt state (no self-referencial strategy): ${corruptedResolveable}`); // ?
  console.log(`# corrupt and unresolveable states: ${corrupt}`); // ?
  console.log(`# partially corrupted projects: ${corruptPs}`); // 4
  for (const pid of corruptedProjects) {
    console.log(`corrupt project: ${pid}`);
  }
  console.log(`# hash strategies present: ${numVs}`);

  // dump
  const stats = {
    // corruptedProjects,
    // files,
    '#AddsUp': doesItAddup,
    '#files': filesLength,
    // states,
    '#states': statesLength,
    '#versions': numVs,
    '#resolvableStates': sound,
    '#invalidStates': invalid,
    '#unresolvableStates': unresolved,
    '#corruptResolveable': corruptedResolveable,
    '#corrupt': corrupt,
    '#corruptProjects': corruptPs,
  };
  await writeFile(`./migrationData/migration-stats.json`, JSON.stringify(stats));
  await writeFile(`./migrationData/resolutions.json`, JSON.stringify(soundStates));
}
// Execute the main function
main();
