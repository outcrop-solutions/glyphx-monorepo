import {HashResolver} from 'business/src/util/HashResolver';
import {StateService} from 'business/src/services/state';
import {S3Manager} from 'core/src/aws';
const TARGET_S3_BUCKET_NAME = 'glyphx-dev';
import {MongoDbConnection} from 'database';
import {databaseTypes} from 'types';
import {ProjectService} from 'business/src/services/project';

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
  const filesToRemove = [];
  const corruptedProjects = [];
  const files = await s3.listObjects('client/');
  // Filter files based on extensions, excluding 'undefined' files
  const datafiles = files.filter(
    (f) => exts.some((ext) => f.endsWith(ext) && !f.includes(`undefined${ext}`)) // Ensure file doesn't include 'undefined' before extension
  );

  // Determine state integrity
  const presence = await Promise.all(
    states.map(async (state) => {
      const stateId = state?._id?.toString();
      const workspaceId = state?.workspace?._id?.toString(); // Assume `workspaceId` is part of state
      const projectId = state?.project?._id?.toString(); // Assume `projectId` is part of state
      // const retval = await StateService.getState(stateId);
      const payloadHash = state?.payloadHash; // Assume `payloadHash` is part of state
      if (projectId) {
        const project = await ProjectService.getProject(projectId);
        if (project) {
          try {
            const resolver = new HashResolver(workspaceId as any, projectId as any, s3);
            const resolution = await resolver.resolve({type: 'project', project});
            if (resolution) {
              versionMap.set(resolution.version, resolution);
            }
          } catch (error) {
            // console.log(`resolution not found for stateId: ${stateId}`);
          }
        }
      }
      // Generate the expected file paths for each extension
      const expectedFiles = exts.map((ext) => `client/${workspaceId}/${projectId}/output/${payloadHash}${ext}`);
      // Check if all expected files are in the S3 file list
      const hasFullSet = expectedFiles.every((expectedFile) => files.includes(expectedFile));
      return {
        stateId,
        workspaceId,
        projectId,
        payloadHash,
        hasFullSet,
        missingFiles: hasFullSet ? [] : expectedFiles.filter((f) => !files.includes(f)), // Get any missing files if not a full set
      };
    })
  );

  // Split based on integrity
  const fullStates = presence.filter((p) => p.hasFullSet);
  const corruptedStates = presence.filter((p) => !p.hasFullSet);

  // Populate potentially corrupt projects
  for (const file of files) {
    if (file.includes('undefined')) {
      filesToRemove.push(file);
      const projectId = file.split('/')[2];
      corruptedProjects.push(projectId);
      continue;
    }
  }

  console.log(`Total number of partially corrupted projects: ${corruptedProjects.length}`); //
  for (const pid of corruptedProjects) {
    console.log(`corrupt project: ${pid}`);
  }
  console.log(`Total number of files: ${files.length}`); // 2037
  console.log(`Total number of states: ${states.length}`); // 573 of 585 have payload hash
  console.log(`Total number of payload versions present: ${versionMap.size}`);
  for (const key of versionMap.keys()) {
    console.log(`PayloadHash Version: ${key}`);
  }
  console.log(`Total number of currently resolvable states: ${fullStates.length}`); // 373
  console.log(`Total number of incomplete states: ${corruptedStates.length}`); // 200
  console.log(`Total number of output data files: ${datafiles.length}`); // 1099

  console.log(`Total number of corrupted files: ${filesToRemove.length}`);
}

// Execute the main function
main();
