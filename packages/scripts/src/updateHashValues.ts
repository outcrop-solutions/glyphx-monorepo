import {WorkspaceModel, StateModel} from 'database/src/mongoose/models';
import {workspaceService, projectService} from 'business/src/services';
import {HashResolver} from 'business/src/util/HashResolver';
import {S3Manager} from 'core/src/aws';
const TARGET_S3_BUCKET_NAME = 'glyphx-prod';

async function run() {
  const s3 = new S3Manager(TARGET_S3_BUCKET_NAME);
  // get iterables from mongo
  const workspaces = await WorkspaceModel.find();
  const states = await StateModel.find();

  await Promise.all(
    workspaces.map(async (workspace) => {
      const workspaceId = workspace.id;
      const projects = workspace.projects;

      await Promise.all(
        projects.map(async (project) => {
          //  check project
          const projectId = project.id as string;
          const req = {type: 'project' as 'project', project};
          const resolver = new HashResolver(workspaceId, projectId, s3);
          // try to resolve data
          const retval = await resolver.resolve(req);
          /**
           * CASE 1 if the hash is up to date do nothing
           */

          /**
           * CASE 2
           * if a previous version, copy the files to the new hash
           */

          /**
           * CASE 3
           */

          // check states within project
          const stateHistory = project.stateHistory;

          await Promise.all(
            stateHistory.map(async (state) => {
              // if state from stateHistory is not found in db, rectify it and abort
              if (!states.map((s) => s.id).includes(state.id)) {
              }

              //   try to resolve data
              const req = {type: 'state' as 'state', state};
              const resolver = new HashResolver(workspaceId, projectId, s3);
              const retval = await resolver.resolve(req);

              /**
               * CASE 2
               * if a previous version, copy the files to the new hash and update state payloadhash
               */
            })
          );
        })
      );
    })
  );
}

run();
